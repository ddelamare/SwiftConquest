import { Action, ActionToken, GameState, HexState, PlayerID } from './Model';
import { findHexWithToken, isNeighbor } from './Selectors';

export function isValidTargetForAction(G: GameState, hex: HexState | undefined, action: ActionToken | undefined): boolean {
  if (!hex || !action) return false;
  const sourceHex = findHexWithToken(G, action.id);
  if (!sourceHex || !isNeighbor(hex, sourceHex)) return false;

  if (action.type === Action.Attack) {
    return !hex.units.some((unit) => unit.owner === action.owner);
  }

  if (action.type === Action.Aid) {
    return G.activeCombatHex !== null && hex.id === G.activeCombatHex;
  }

  return false;
}

export function validTargetIDs(G: GameState, playerID: PlayerID): Set<string> {
  const selectedTokenID = G.players[playerID]?.selectedToken;
  const selectedHex = findHexWithToken(G, selectedTokenID);
  const action = selectedHex?.tokens.find((token) => token.id === selectedTokenID);
  if (!action || action.owner !== playerID) return new Set();
  return new Set(G.map.filter((hex) => isValidTargetForAction(G, hex, action)).map((hex) => hex.id));
}

