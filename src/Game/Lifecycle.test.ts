import { Action, HexTerrain, Phase, Stage } from '../Domain/Model';
import { endIfCond } from './Game.endIf';
import { awardIncome, resetRound } from './Game.lifecycle';
import { Game } from './Game';
import { createTestGame } from './Game.testUtils';

describe('income and reset lifecycle', () => {
  test('controlled mines award gold without awarding gems unless Gather is present', () => {
    const G = createTestGame();
    const mine = G.map.find((hex) => hex.type === HexTerrain.Mine)!;
    mine.units.push({ id: 'unit:0', owner: '0' });
    awardIncome({ G });
    expect(G.players['0']).toMatchObject({ gold: 11, gems: 0 });

    mine.tokens.push({ id: 'gather', type: Action.Gather, owner: '0', rank: null });
    awardIncome({ G });
    expect(G.players['0']).toMatchObject({ gold: 12, gems: 1 });
  });

  test('contested and empty mines award nothing', () => {
    const G = createTestGame();
    const mines = G.map.filter((hex) => hex.type === HexTerrain.Mine);
    mines[0].units.push({ id: 'unit:0', owner: '0' }, { id: 'unit:1', owner: '1' });
    mines[0].tokens.push({ id: 'gather', type: Action.Gather, owner: '0', rank: null });
    awardIncome({ G });
    expect(G.players['0']).toMatchObject({ gold: 10, gems: 0 });
    expect(G.players['1']).toMatchObject({ gold: 10, gems: 0 });
  });

  test('reset returns owned board tokens exactly once and clears transient match facts', () => {
    const G = createTestGame();
    const token = G.players['0'].availableActions.shift()!;
    G.map[0].tokens.push(token);
    G.players['0'].selectedToken = token.id;
    G.players['0'].bid = 3;
    G.activeCombatHex = G.map[1].id;
    G.attackerSourceHex = G.map[0].id;
    G.attackerID = '0';

    resetRound({ G });
    expect(G.players['0'].availableActions.filter((candidate) => candidate.id === token.id)).toHaveLength(1);
    expect(G.map.every((hex) => hex.tokens.length === 0)).toBe(true);
    expect(G.players['0'].selectedToken).toBeNull();
    expect(G.players['0'].bid).toBeNull();
    expect(G.activeCombatHex).toBeNull();
    expect(G.attackerSourceHex).toBeNull();
    expect(G.attackerID).toBeNull();
  });
});

describe('victory and phase configuration', () => {
  test('victory thresholds are inclusive and lower values do not end the game', () => {
    const G = createTestGame();
    G.players['0'].gems = 9;
    G.players['0'].gold = 29;
    expect(endIfCond({ G })).toBe(false);
    G.players['0'].gems = 10;
    expect(endIfCond({ G })).toEqual({ winner: '0' });

    G.players['0'].gems = 0;
    G.players['1'].gold = 30;
    expect(endIfCond({ G })).toEqual({ winner: '1' });
  });

  test('phase graph and player stages are wired through centralized constants', () => {
    const game = Game() as any;
    expect(game.phases[Phase.ActionDraft]).toMatchObject({ start: true, next: Phase.InitialUnitPlacement });
    expect(game.phases[Phase.InitialUnitPlacement].next).toBe(Phase.ActionPlacement);
    expect(game.phases[Phase.ActionPlacement].next).toBe(Phase.AttackResolution);
    expect(game.phases[Phase.AttackResolution].next).toBe(Phase.Income);
    expect(game.phases[Phase.Income].next).toBe(Phase.Reset);
    expect(game.phases[Phase.Reset].next).toBe(Phase.ActionDraft);
    expect(game.phases[Phase.AttackResolution].turn.stages[Stage.BidSelection].moves.submitBid.redact).toBe(true);
  });
});

