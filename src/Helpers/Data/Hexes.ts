import Board from "../../Board"
import { HexType } from "../../Component/Hex/Hex";

enum Hexes {
    Standard = 0,
    Keep,
    Mine
}

const HexColor = {
    Standard: "#d2b48c",
    Alt: "#9b856a"
}

const FindHexagonInBoard = function(q: number ,r: number ,s: number){
    return Board.HexMap.find((hex) => hex.q === q && hex.r === r && hex.s === s);
}

const FindHexInGameState = function (G : any, q: number, r: number, s: number){
    return G.map.find((hex : HexType) => hex.tile.q === q && hex.tile.r === r && hex.tile.s === s);
}

const IsNeighbor = function (left: HexType, right: HexType) {
    var dQ = Math.abs(left.tile.q - right.tile.q);
    var dR = Math.abs(left.tile.r - right.tile.r);
    var dS = Math.abs(left.tile.s - right.tile.s);
    return (dQ <= 1 && dR <= 1 && dS <= 1) && !(dQ === 0 && dR === 0 && dS === 0);
}

const GetNeighbors = function(G : any, hex: HexType){
    return G.map.filter((h2 : HexType) => IsNeighbor(hex, h2));
}
export { FindHexInGameState, FindHexagonInBoard, Hexes, HexColor, IsNeighbor, GetNeighbors }