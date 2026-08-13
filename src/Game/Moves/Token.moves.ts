import { INVALID_MOVE } from 'boardgame.io/core';
import { findByID, findHex, findHexWithToken, unitsForPlayer } from '../../Domain/Selectors';
import type { MovePropsType } from '../Game.types';

export const selectToken = {
  move: ({ G, playerID }: MovePropsType, tokenID: string) => {
    const player = G.players[playerID];
    if (!player) return INVALID_MOVE;

    const availableToken = findByID(player.availableActions, tokenID);
    const placedToken = findHexWithToken(G, tokenID)?.tokens.find((token) => token.id === tokenID);
    const token = availableToken ?? placedToken;
    if (!token || token.owner !== playerID) return INVALID_MOVE;

    player.selectedToken = tokenID;
  },
  redact: true,
  noLimit: true,
};

export const placeToken = {
  move: ({ G, playerID }: MovePropsType, hexID: string) => {
    const player = G.players[playerID];
    const hex = findHex(G, hexID);
    const token = player ? findByID(player.availableActions, player.selectedToken) : undefined;
    if (!player || !hex || !token || token.owner !== playerID || hex.tokens.length > 0) return INVALID_MOVE;
    if (unitsForPlayer(hex, playerID).length === 0) return INVALID_MOVE;

    hex.tokens.push(token);
    player.availableActions.splice(player.availableActions.indexOf(token), 1);
  },
  redact: true,
  noLimit: true,
};

export const clearToken = {
  move: ({ G, playerID }: MovePropsType, tokenID: string, hexID: string) => {
    const player = G.players[playerID];
    const hex = findHex(G, hexID);
    const token = hex ? findByID(hex.tokens, tokenID) : undefined;
    if (!player || !hex || !token || token.owner !== playerID) return INVALID_MOVE;

    hex.tokens.splice(hex.tokens.indexOf(token), 1);
    player.availableActions.push(token);
    if (player.selectedToken === tokenID) player.selectedToken = null;
  },
  redact: true,
  noLimit: true,
};

export function lockInTokens({ ctx, events }: MovePropsType) {
  events.endStage();
  if (ctx.activePlayers && Object.keys(ctx.activePlayers).length === 1) {
    events.endPhase();
  }
}

