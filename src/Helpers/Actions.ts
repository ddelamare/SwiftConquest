import { Ctx } from "boardgame.io";
import { HexType } from "../Component/Hex/Hex"
import { TokenType } from "../Component/Token"
import { GameStateType } from "../Game/Game.setup"
import { FindHexagonWithToken, IsNeighbor } from "./Hexes";
import { GetSelectedTokenId, IsPlayerActive, GetPlayerStage } from "./Players";
import { FindElementById } from "../Utils/Array";
import { FindTokenInMap } from "./Tokens";
import { act } from "react";

enum Action {
    Unknown = 0,
    Attack,
    Defend,
    Gather,
    Aid
}

const IsHexValidTargetForAction = function(G : GameStateType, hex: HexType, action: TokenType)
{    
    var tokenHex = FindHexagonWithToken(G, action.id);
    if (!tokenHex || !IsNeighbor(hex, tokenHex)){
        return false;
    }
    
    if (action.type === Action.Attack) {
        // Hex is valid to attack if it's empty or all units are another players
        return !hex.units.some((u) => u.owner === action.owner);
    }
    else if (action.type === Action.Aid) {
        if (!G.activeCombatHex)
            return false;

        return hex.id === G.activeCombatHex;
    }
}

const IsReadyToLockInTarget = function(G: GameStateType, ctx: Ctx, playerID: string | null) {
    if (!IsPlayerActive(ctx, playerID) || !G.activeCombatHex || !GetSelectedTokenId(G, playerID) ){
        return false;
    }

    if (GetPlayerStage(ctx, playerID) !== "attackSelection"){
        return false;
    }

    var hex = FindElementById(G.map, G.activeCombatHex);
    var targetHex = FindTokenInMap(G, GetSelectedTokenId(G, playerID));
    return IsHexValidTargetForAction(G, hex, targetHex);
}

export default Action
export {IsHexValidTargetForAction, IsReadyToLockInTarget}