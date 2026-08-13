import { INVALID_MOVE } from 'boardgame.io/core';
import { Action } from '../../Domain/Model';
import { adjacentHexIndex, cloneGameState, createEvents, createTestContext, createTestGame, placeOwnedAction } from '../Game.testUtils';
import { pickAction, placeUnit } from './Setup.moves';
import { clearToken, placeToken, selectToken } from './Token.moves';
import { lockInTarget, selectTarget } from './Combat.moves';

const props = (G, playerID = '0') => ({ G, ctx: createTestContext(), events: createEvents(), playerID });

describe('setup moves', () => {
  test.each([-1, 0.5, 99])('invalid draft index %p leaves state unchanged', (poolIndex) => {
    const G = createTestGame();
    const before = cloneGameState(G);
    expect(pickAction(props(G), poolIndex)).toBe(INVALID_MOVE);
    expect(G).toEqual(before);
  });

  test('draft transfers exactly one token and assigns ownership', () => {
    const G = createTestGame();
    const draftedID = G.actionPool[1].id;
    pickAction(props(G), 1);
    expect(G.actionPool).toHaveLength(3);
    expect(G.players['0'].availableActions).toContainEqual(expect.objectContaining({ id: draftedID, owner: '0' }));
  });

  test('unit placement uses a synchronized monotonic identifier and rejects occupied hexes', () => {
    const G = createTestGame();
    const firstHex = G.map[0];
    const secondHex = G.map[1];
    placeUnit(props(G), firstHex.id);
    placeUnit(props(G, '1'), secondHex.id);
    expect(firstHex.units[0].id).toBe('unit:0');
    expect(secondHex.units[0].id).toBe('unit:1');

    const before = cloneGameState(G);
    expect(placeUnit(props(G, '1'), firstHex.id)).toBe(INVALID_MOVE);
    expect(G).toEqual(before);
  });
});

describe('token moves', () => {
  test('select, place, and clear preserve token identity and ownership', () => {
    const G = createTestGame();
    const player = G.players['0'];
    const hex = G.map[0];
    hex.units.push({ id: 'unit:0', owner: '0' });
    const token = player.availableActions[0];

    (selectToken as any).move(props(G), token.id);
    (placeToken as any).move(props(G), hex.id);
    expect(hex.tokens).toEqual([token]);
    expect(player.availableActions).not.toContain(token);

    (clearToken as any).move(props(G), token.id, hex.id);
    expect(hex.tokens).toHaveLength(0);
    expect(player.availableActions).toContain(token);
    expect(player.selectedToken).toBeNull();
  });

  test('placing on an unowned or occupied hex is atomic', () => {
    const G = createTestGame();
    const player = G.players['0'];
    const token = player.availableActions[0];
    player.selectedToken = token.id;
    const noUnitHex = G.map[0];
    const beforeNoUnit = cloneGameState(G);
    expect((placeToken as any).move(props(G), noUnitHex.id)).toBe(INVALID_MOVE);
    expect(G).toEqual(beforeNoUnit);

    noUnitHex.units.push({ id: 'unit:0', owner: '0' });
    noUnitHex.tokens.push({ id: 'other', type: Action.Aid, owner: '0', rank: null });
    const beforeOccupied = cloneGameState(G);
    expect((placeToken as any).move(props(G), noUnitHex.id)).toBe(INVALID_MOVE);
    expect(G).toEqual(beforeOccupied);
  });

  test('a player cannot clear another player token', () => {
    const G = createTestGame();
    const { token, hex } = placeOwnedAction(G, '1', Action.Attack);
    const before = cloneGameState(G);
    expect((clearToken as any).move(props(G), token.id, hex.id)).toBe(INVALID_MOVE);
    expect(G).toEqual(before);
  });
});

describe('target moves', () => {
  test('selectTarget accepts an adjacent enemy target and rejects a distant target atomically', () => {
    const G = createTestGame();
    const { hex: source } = placeOwnedAction(G, '0', Action.Attack);
    source.units.push({ id: 'attacker', owner: '0' });
    const adjacent = G.map[adjacentHexIndex(G, 0)];
    adjacent.units.push({ id: 'defender', owner: '1' });
    expect(selectTarget(props(G), adjacent.id)).toBeUndefined();
    expect(G.activeCombatHex).toBe(adjacent.id);

    G.activeCombatHex = null;
    const distant = G.map.find((hex) => Math.abs(hex.tile.q - source.tile.q) > 1)!;
    const before = cloneGameState(G);
    expect(selectTarget(props(G), distant.id)).toBe(INVALID_MOVE);
    expect(G).toEqual(before);
  });

  test('locking a contested target records exact source and activates both bidders', () => {
    const G = createTestGame();
    const { hex: source } = placeOwnedAction(G, '0', Action.Attack);
    source.units.push({ id: 'attacker', owner: '0' });
    const target = G.map[adjacentHexIndex(G, 0)];
    target.units.push({ id: 'defender', owner: '1' });
    G.activeCombatHex = target.id;
    const moveProps = props(G);

    lockInTarget(moveProps);
    expect(G.attackerID).toBe('0');
    expect(G.attackerSourceHex).toBe(source.id);
    expect(moveProps.events.setActivePlayers).toHaveBeenCalledWith({
      value: { '0': 'bidSelection', '1': 'bidSelection' },
    });
  });
});
