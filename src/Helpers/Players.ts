import { Ctx } from "boardgame.io";

export function IsPlayerActive(ctx: Ctx, playerID: string | null){
    if (playerID === null)
    {
        return false;
    }

    return (ctx.activePlayers === null && ctx.currentPlayer === playerID)
        || (ctx.activePlayers && Object.keys(ctx.activePlayers).includes(playerID))
}