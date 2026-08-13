import { Action, ActionToken, HexCoordinate, HexState, HexTerrain, PlayerID, PlayerState } from './Model';

const MINE_INDICES = new Set([5, 7, 29, 31]);

export function createHexagonalCoordinates(radius: number): HexCoordinate[] {
  const coordinates: HexCoordinate[] = [];
  for (let q = -radius; q <= radius; q += 1) {
    const firstR = Math.max(-radius, -q - radius);
    const lastR = Math.min(radius, -q + radius);
    for (let r = firstR; r <= lastR; r += 1) {
      coordinates.push({ q, r, s: -q - r });
    }
  }
  return coordinates;
}

export const BOARD_COORDINATES = createHexagonalCoordinates(3);

export function coordinateID({ q, r, s }: HexCoordinate): string {
  return `hex:${q},${r},${s}`;
}

export function createBoard(): HexState[] {
  return BOARD_COORDINATES.map((tile, index) => ({
    id: coordinateID(tile),
    tokens: [],
    units: [],
    tile,
    type: MINE_INDICES.has(index) ? HexTerrain.Mine : HexTerrain.Standard,
  }));
}

export function createDraftPool(round: number): ActionToken[] {
  return [Action.Attack, Action.Defend, Action.Gather, Action.Aid].map((type) => ({
    id: `draft:${round}:${Action[type].toLowerCase()}`,
    type,
    owner: null,
    rank: null,
  }));
}

export function createPlayer(playerID: PlayerID): PlayerState {
  const ownedActions = [Action.Attack, Action.Gather, Action.Aid];
  return {
    availableActions: ownedActions.map((type) => ({
      id: `player:${playerID}:starting:${Action[type].toLowerCase()}`,
      type,
      owner: playerID,
      rank: null,
    })),
    selectedToken: null,
    gold: 10,
    gems: 0,
    bid: null,
  };
}

