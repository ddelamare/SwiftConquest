import { GameStateType } from "../Game/Game.setup"
import { FindElementById } from "../Utils/Array";

const FindTokenInMap = function (G : GameStateType, id : string | null) {
    if (!id)
    {
        return null;
    }
    return FindElementById(G.map.flatMap(h => h.tokens), id);
}

export {FindTokenInMap}