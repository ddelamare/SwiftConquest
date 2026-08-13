import { INVALID_MOVE } from 'boardgame.io/core';
import { Action, HexTerrain } from '../Domain/Model';
import { validTargetIDs } from '../Domain/Rules';
import { awardIncome, resetRound } from './Game.lifecycle';
import { defaultOptions } from './Game.options';
import { playerView, setupGame } from './Game.setup';
import { selectToken } from './Moves/Token.moves';
import { submitBid } from './Moves/Combat.moves';

const context = (numPlayers = 2) => ({ numPlayers, phase: 'actionPlacementPhase' } as any);
const events = { endPhase: jest.fn(), endStage: jest.fn(), setActivePlayers: jest.fn() };

describe('peer-safe game architecture', () => {
  test('setup is deterministic and JSON serializable', () => {
    const setup = setupGame(defaultOptions);
    const first = setup({ ctx: context() });
    const second = setup({ ctx: context() });

    expect(second).toEqual(first);
    expect(() => JSON.stringify(first)).not.toThrow();
    expect(new Set(first.map.map((hex) => hex.id)).size).toBe(first.map.length);
  });

  test('playerView masks committed secrets from opponents and spectators', () => {
    const G = setupGame(defaultOptions)({ ctx: context() });
    G.players['0'].bid = 4;
    G.players['0'].selectedToken = G.players['0'].availableActions[0].id;

    const ownerView = playerView({ G, ctx: context(), playerID: '0' });
    const opponentView = playerView({ G, ctx: context(), playerID: '1' });
    const spectatorView = playerView({ G, ctx: context(), playerID: null });

    expect(ownerView.players['0'].bid).toBe(4);
    expect(opponentView.players['0'].bid).toBeNull();
    expect(opponentView.players['0'].selectedToken).toBeNull();
    expect(opponentView.players['0'].availableActions[0].type).toBe(Action.Unknown);
    expect(spectatorView.players['0'].bid).toBeNull();
  });

  test('a player cannot select another player token', () => {
    const G = setupGame(defaultOptions)({ ctx: context() });
    const otherTokenID = G.players['1'].availableActions[0].id;
    const move = (selectToken as any).move;

    expect(move({ G, ctx: context(), events, playerID: '0' }, otherTokenID)).toBe(INVALID_MOVE);
    expect(G.players['0'].selectedToken).toBeNull();
  });

  test('uncommitted highlights are derived and never stored in G', () => {
    const G = setupGame(defaultOptions)({ ctx: context() });
    const player = G.players['0'];
    const source = G.map[0];
    source.units.push({ id: 'unit:test', owner: '0' });
    const attack = player.availableActions.find((token) => token.type === Action.Attack)!;
    player.availableActions.splice(player.availableActions.indexOf(attack), 1);
    source.tokens.push(attack);
    player.selectedToken = attack.id;

    expect(validTargetIDs(G, '0').size).toBeGreaterThan(0);
    expect(G.map.some((hex) => 'isHighlighted' in hex)).toBe(false);
  });

  test('bids must be affordable non-negative integers', () => {
    const G = setupGame(defaultOptions)({ ctx: context() });
    const move = (submitBid as any).move;
    const bidContext = { ...context(), activePlayers: { '0': 'bidSelection', '1': 'bidSelection' } };

    expect(move({ G, ctx: bidContext, events, playerID: '0' }, 1.5)).toBe(INVALID_MOVE);
    expect(move({ G, ctx: bidContext, events, playerID: '0' }, 11)).toBe(INVALID_MOVE);
    expect(G.players['0'].bid).toBeNull();
  });

  test('income and reset are explicit authoritative lifecycle operations', () => {
    const G = setupGame(defaultOptions)({ ctx: context() });
    const mine = G.map.find((hex) => hex.type === HexTerrain.Mine)!;
    mine.units.push({ id: 'unit:mine', owner: '0' });
    mine.tokens.push({ id: 'gather:test', type: Action.Gather, owner: '0', rank: null });

    awardIncome({ G });
    expect(G.players['0']).toMatchObject({ gold: 11, gems: 1 });

    resetRound({ G });
    expect(G.round).toBe(2);
    expect(mine.tokens).toHaveLength(0);
    expect(G.players['0'].availableActions.some((token) => token.id === 'gather:test')).toBe(true);
    expect(G.actionPool.every((token) => token.id.startsWith('draft:2:'))).toBe(true);
  });
});

