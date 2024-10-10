import { GameStateType } from "../Game/Game.setup"

const FindTokenInMap = function (G : GameStateType, id : string) {
    return G.map.flatMap(h => h.tokens).find(t => t.id === id);
}

export {FindTokenInMap}