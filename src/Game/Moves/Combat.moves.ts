import { INVALID_MOVE } from 'boardgame.io/core';
import { isValidTargetForAction } from '../../Domain/Rules';
import { findHex, findHexWithToken, findTokenOnMap } from '../../Domain/Selectors';
import { Stage } from '../../Domain/Model';
import { resolveCombat } from '../Combat';
import type { MovePropsType } from '../Game.types';

export function selectTarget({ G, playerID }: MovePropsType, hexID: string) {
  const player = G.players[playerID];
  const targetHex = findHex(G, hexID);
  const action = findTokenOnMap(G, player?.selectedToken ?? null);
  if (!player || action?.owner !== playerID || !isValidTargetForAction(G, targetHex, action)) {
    return INVALID_MOVE;
  }
  G.activeCombatHex = targetHex!.id;
}

export function lockInTarget({ G, events, playerID }: MovePropsType) {
  const player = G.players[playerID];
  const targetHex = findHex(G, G.activeCombatHex);
  const action = findTokenOnMap(G, player?.selectedToken ?? null);
  const sourceHex = findHexWithToken(G, player?.selectedToken ?? null);
  if (!player || action?.owner !== playerID || !sourceHex || !isValidTargetForAction(G, targetHex, action)) {
    return INVALID_MOVE;
  }

  G.attackerID = playerID;
  G.attackerSourceHex = sourceHex.id;
  const defenderID = targetHex!.units.find((unit) => unit.owner !== playerID)?.owner ?? null;
  if (!defenderID) {
    player.bid = 0;
    if (!resolveCombat(G)) return INVALID_MOVE;
    events.endPhase();
    return;
  }

  events.setActivePlayers({
    value: {
      [playerID]: Stage.BidSelection,
      [defenderID]: Stage.BidSelection,
    },
  });
}

export const submitBid = {
  move: ({ G, ctx, events, playerID }: MovePropsType, amount: number) => {
    const player = G.players[playerID];
    if (!player || !Number.isInteger(amount) || amount < 0 || amount > player.gold || player.bid !== null) {
      return INVALID_MOVE;
    }

    player.bid = amount;
    const activePlayerIDs = Object.keys(ctx.activePlayers ?? {});
    const allPlayersBid = activePlayerIDs.every((id) => G.players[id]?.bid !== null);
    if (allPlayersBid) {
      if (!resolveCombat(G)) return INVALID_MOVE;
      events.endPhase();
    } else {
      events.endStage();
    }
  },
  redact: true,
  noLimit: true,
};

