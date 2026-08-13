import type { GameState, HexState, PlayerID } from '../Domain/Model';
import { hexesWithUnits, unitsForPlayer } from '../Domain/Selectors';

export const GetHexesWithDudes = (G: GameState) => hexesWithUnits(G);
export const GetUnitsForPlayer = (hex: HexState, playerID: PlayerID | number) => unitsForPlayer(hex, String(playerID));
