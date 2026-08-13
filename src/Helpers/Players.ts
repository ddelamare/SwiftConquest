import { Ctx } from "boardgame.io";
import type { GameState } from '../Domain/Model';

export function IsPlayerActive(ctx: Ctx, playerID: string | null){
    if (playerID === null)
    {
        return false;
    }

    return (ctx.activePlayers === null && ctx.currentPlayer === playerID)
        || (ctx.activePlayers && Object.keys(ctx.activePlayers).includes(playerID))
}

export function GetSelectedTokenId(G: GameState, playerID: string | null) : string | null {
    if (!playerID)
        return null;
    return G.players[playerID]?.selectedToken ?? null;
}

export function GetPlayerStage(ctx: Ctx, playerID: string | null){
    if (!IsPlayerActive(ctx,playerID) || !playerID || !ctx.activePlayers){
        return null
    }

    return ctx.activePlayers[playerID];
}
