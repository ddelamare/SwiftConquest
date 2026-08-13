import { ActionToken, GameState, HexState, PlayerID, UnitState } from './Model';

export function findByID<T extends { id: string }>(items: readonly T[], id: string | null): T | undefined {
  if (!id) return undefined;
  return items.find((item) => item.id === id);
}

export function findHex(G: GameState, id: string | null): HexState | undefined {
  return findByID(G.map, id);
}

export function findHexAt(G: GameState, q: number, r: number, s: number): HexState | undefined {
  return G.map.find((hex) => hex.tile.q === q && hex.tile.r === r && hex.tile.s === s);
}

export function findHexWithToken(G: GameState, tokenID: string | null): HexState | undefined {
  if (!tokenID) return undefined;
  return G.map.find((hex) => hex.tokens.some((token) => token.id === tokenID));
}

export function findTokenOnMap(G: GameState, tokenID: string | null): ActionToken | undefined {
  const hex = findHexWithToken(G, tokenID);
  return hex ? findByID(hex.tokens, tokenID) : undefined;
}

export function unitsForPlayer(hex: HexState, playerID: PlayerID): UnitState[] {
  return hex.units.filter((unit) => unit.owner === playerID);
}

export function hexesWithUnits(G: GameState): HexState[] {
  return G.map.filter((hex) => hex.units.length > 0);
}

export function isNeighbor(left: HexState, right: HexState): boolean {
  const dQ = Math.abs(left.tile.q - right.tile.q);
  const dR = Math.abs(left.tile.r - right.tile.r);
  const dS = Math.abs(left.tile.s - right.tile.s);
  return dQ <= 1 && dR <= 1 && dS <= 1 && (dQ !== 0 || dR !== 0 || dS !== 0);
}

export function neighborsOf(G: GameState, hex: HexState): HexState[] {
  return G.map.filter((candidate) => isNeighbor(hex, candidate));
}

export function controllingPlayer(hex: HexState): PlayerID | null {
  const owners = new Set(hex.units.map((unit) => unit.owner));
  return owners.size === 1 ? Array.from(owners)[0] : null;
}

