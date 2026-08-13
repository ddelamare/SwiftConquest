import { INVALID_MOVE } from 'boardgame.io/core';
import { resolveCombat } from './Combat';
import { cloneGameState, createEvents, createTestContext, createTestGame, prepareCombat } from './Game.testUtils';
import { submitBid } from './Moves/Combat.moves';

describe('combat resolution', () => {
  test('ties favor the attacker, spend bids, and move into a cleared target', () => {
    const G = createTestGame();
    const { source, target } = prepareCombat(G, { attackerUnits: 1, defenderUnits: 1, attackerBid: 2, defenderBid: 2 });
    expect(resolveCombat(G)).toBe(true);

    expect(source.units).toHaveLength(0);
    expect(target.units).toEqual([{ id: 'attacker:0', owner: '0' }]);
    expect(G.players['0'].gold).toBe(8);
    expect(G.players['1'].gold).toBe(8);
    expect(G.players['0'].bid).toBeNull();
    expect(G.players['1'].bid).toBeNull();
    expect(G.activeCombatHex).toBeNull();
    expect(G.attackerSourceHex).toBeNull();
  });

  test('a winning defender removes one attacker and keeps the target', () => {
    const G = createTestGame();
    const { source, target } = prepareCombat(G, { attackerUnits: 2, defenderUnits: 2, defenderBid: 2 });
    expect(resolveCombat(G)).toBe(true);
    expect(source.units).toHaveLength(1);
    expect(source.units[0].owner).toBe('0');
    expect(target.units).toHaveLength(2);
    expect(target.units.every((unit) => unit.owner === '1')).toBe(true);
  });

  test('defend doubles unit strength before bids', () => {
    const G = createTestGame();
    const { source, target } = prepareCombat(G, { attackerUnits: 2, defenderUnits: 1, defend: true });
    resolveCombat(G);
    expect(source.units).toHaveLength(0);
    expect(target.units.filter((unit) => unit.owner === '0')).toHaveLength(2);
  });

  test('remaining defenders prevent attackers from occupying the same hex', () => {
    const G = createTestGame();
    const { source, target } = prepareCombat(G, { attackerUnits: 3, defenderUnits: 2, attackerBid: 1 });
    resolveCombat(G);
    expect(target.units.filter((unit) => unit.owner === '1')).toHaveLength(1);
    expect(target.units.some((unit) => unit.owner === '0')).toBe(false);
    expect(source.units.filter((unit) => unit.owner === '0')).toHaveLength(3);
  });

  test('invalid combat references do not mutate state', () => {
    const G = createTestGame();
    G.attackerID = '0';
    G.attackerSourceHex = 'missing';
    G.activeCombatHex = G.map[0].id;
    const before = cloneGameState(G);
    expect(resolveCombat(G)).toBe(false);
    expect(G).toEqual(before);
  });
});

describe('blind bid workflow', () => {
  test('first bidder ends only their stage; final bidder resolves and ends the phase', () => {
    const G = createTestGame();
    prepareCombat(G, { attackerUnits: 1, defenderUnits: 1 });
    G.players['0'].bid = null;
    G.players['1'].bid = null;
    const events = createEvents();
    const ctx = createTestContext({ activePlayers: { '0': 'bidSelection', '1': 'bidSelection' } });
    const move = (submitBid as any).move;

    expect(move({ G, ctx, events, playerID: '0' }, 1)).toBeUndefined();
    expect(G.players['0'].bid).toBe(1);
    expect(events.endStage).toHaveBeenCalledTimes(1);
    expect(events.endPhase).not.toHaveBeenCalled();

    expect(move({ G, ctx, events, playerID: '1' }, 0)).toBeUndefined();
    expect(events.endPhase).toHaveBeenCalledTimes(1);
    expect(G.players['0'].bid).toBeNull();
    expect(G.players['1'].bid).toBeNull();
  });

  test('a player cannot submit twice', () => {
    const G = createTestGame();
    G.players['0'].bid = 2;
    const before = cloneGameState(G);
    const result = (submitBid as any).move({
      G,
      ctx: createTestContext({ activePlayers: { '0': 'bidSelection', '1': 'bidSelection' } }),
      events: createEvents(),
      playerID: '0',
    }, 3);
    expect(result).toBe(INVALID_MOVE);
    expect(G).toEqual(before);
  });
});
