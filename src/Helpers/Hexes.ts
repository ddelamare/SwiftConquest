import { BOARD_COORDINATES } from '../Domain/BoardDefinition';
import { HexTerrain as Hexes } from '../Domain/Model';
import type { GameState, HexState } from '../Domain/Model';
import { findHexAt, findHexWithToken, isNeighbor, neighborsOf } from '../Domain/Selectors';

const HexColor = {
  Standard: '#d2b48c',
  Alt: '#9b856a',
};

const FindHexagonInBoard = (q: number, r: number, s: number) => (
  BOARD_COORDINATES.find((hex) => hex.q === q && hex.r === r && hex.s === s)
);

const FindHexInGameState = (G: GameState, q: number, r: number, s: number) => findHexAt(G, q, r, s);
const FindHexagonWithToken = (G: GameState, tokenID: string) => findHexWithToken(G, tokenID);
const IsNeighbor = (left: HexState, right: HexState) => isNeighbor(left, right);
const GetNeighbors = (G: GameState, hex: HexState) => neighborsOf(G, hex);

export { FindHexInGameState, FindHexagonInBoard, Hexes, HexColor, IsNeighbor, GetNeighbors, FindHexagonWithToken };
