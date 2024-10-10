import { Ctx } from "boardgame.io";
import { GameStateType } from "../Game/Game.setup";

export function IsPlayerActive(ctx: Ctx, playerID: string | null){
    if (playerID === null)
    {
        return false;
    }

    return (ctx.activePlayers === null && ctx.currentPlayer === playerID)
        || (ctx.activePlayers && Object.keys(ctx.activePlayers).includes(playerID))
}

export function GetSelectedTokenId(G: GameStateType, playerID: string | null) : string | null {
    if (!playerID)
        return null;
    return G.players[playerID].selectedToken;
}

export function GetPlayerStage(ctx: Ctx, playerID: string | null){
    if (!IsPlayerActive(ctx,playerID) || !playerID){
        return null
    }

    return ctx.activePlayers![playerID];
}
