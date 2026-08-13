import type { Ctx } from 'boardgame.io';
import { Action, ActionToken, GameState, HexState } from '../Domain/Model';
import { isValidTargetForAction } from '../Domain/Rules';
import { findHex, findTokenOnMap } from '../Domain/Selectors';
import { GetPlayerStage, GetSelectedTokenId, IsPlayerActive } from './Players';

export function IsHexValidTargetForAction(G: GameState, hex: HexState | undefined, action: ActionToken | undefined) {
  return isValidTargetForAction(G, hex, action);
}

export function IsReadyToLockInTarget(G: GameState, ctx: Ctx, playerID: string | null): boolean {
  const selectedTokenID = GetSelectedTokenId(G, playerID);
  if (!playerID || !IsPlayerActive(ctx, playerID) || !G.activeCombatHex || !selectedTokenID) return false;
  if (GetPlayerStage(ctx, playerID) !== 'attackSelection') return false;

  return isValidTargetForAction(
    G,
    findHex(G, G.activeCombatHex),
    findTokenOnMap(G, selectedTokenID),
  );
}

export default Action;
