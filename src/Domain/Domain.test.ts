import { BOARD_COORDINATES, coordinateID, createBoard, createDraftPool } from './BoardDefinition';
import { Action, HexTerrain } from './Model';
import { isNeighbor, neighborsOf } from './Selectors';
import { createTestGame } from '../Game/Game.testUtils';

describe('domain and board definition', () => {
  test('the radius-three board has stable coordinates and four mines', () => {
    const board = createBoard();
    expect(BOARD_COORDINATES).toHaveLength(37);
    expect(board).toHaveLength(37);
    expect(board.filter((hex) => hex.type === HexTerrain.Mine)).toHaveLength(4);
    expect(new Set(board.map((hex) => hex.id)).size).toBe(37);
    expect(board.every((hex) => hex.id === coordinateID(hex.tile))).toBe(true);
  });

  test('neighbor relation is symmetric, excludes self, and produces six center neighbors', () => {
    const G = createTestGame();
    const center = G.map.find((hex) => hex.tile.q === 0 && hex.tile.r === 0)!;
    expect(isNeighbor(center, center)).toBe(false);
    expect(neighborsOf(G, center)).toHaveLength(6);
    expect(neighborsOf(G, center).every((neighbor) => isNeighbor(neighbor, center))).toBe(true);
  });

  test('draft pool identifiers are deterministic and round-scoped', () => {
    const first = createDraftPool(1);
    const second = createDraftPool(2);
    expect(first.map((token) => token.type)).toEqual([Action.Attack, Action.Defend, Action.Gather, Action.Aid]);
    expect(first.every((token) => token.owner === null)).toBe(true);
    expect(first.map((token) => token.id)).not.toEqual(second.map((token) => token.id));
    expect(createDraftPool(1)).toEqual(first);
  });
});

