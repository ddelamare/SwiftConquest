import Board from "../../Board"

enum Hexes {
    Standard = 0,
    Keep,
    Mine
}

const FindHexagonInBoard = function(q ,r ,s){
    return Board.HexMap.find((hex) => hex.q === q && hex.r === r && hex.s === s);
}

const FindHexInGameState = function (G, q, r, s){
    return G.map.find((hex) => hex.tile.q === q && hex.tile.r === r && hex.tile.s === s);
}

export { FindHexInGameState, FindHexagonInBoard, Hexes }