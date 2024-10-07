import { HexType } from "../Component/Hex/Hex"
import { TokenType } from "../Component/Token"
import { GameStateType } from "../Game/Game.setup"
import { FindHexagonWithToken, IsNeighbor } from "./Hexes";

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
}

export default Action
export {IsHexValidTargetForAction}