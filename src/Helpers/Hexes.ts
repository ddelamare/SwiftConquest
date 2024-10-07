import Board from "../Board"
import { HexType } from "../Component/Hex/Hex";
import  { TokenType } from "../Component/Token";
import { GameStateType } from "../Game/Game.setup";

enum Hexes {
    Standard = 'standard',
    Keep = 'keep',
    Mine = 'mine'
}

const HexColor = {
    Standard: "#d2b48c",
    Alt: "#9b856a"
}



const FindHexagonInBoard = function(q: number ,r: number ,s: number){
    return Board.HexMap.find((hex) => hex.q === q && hex.r === r && hex.s === s);
}

const FindHexInGameState = function (G : GameStateType, q: number, r: number, s: number){
    return G.map.find((hex : HexType) => hex.tile.q === q && hex.tile.r === r && hex.tile.s === s);
}

const FindHexagonWithToken = function (G : GameStateType, tokenId: string){
    return G.map.find((hex : HexType) => hex.tokens.find((token : TokenType) => token.id === tokenId));
}

const IsNeighbor = function (left: HexType, right: HexType) {
    var dQ = Math.abs(left.tile.q - right.tile.q);
    var dR = Math.abs(left.tile.r - right.tile.r);
    var dS = Math.abs(left.tile.s - right.tile.s);
    return (dQ <= 1 && dR <= 1 && dS <= 1) && !(dQ === 0 && dR === 0 && dS === 0);
}

const GetNeighbors = function(G : any, hex: HexType) : HexType[] {
    return G.map.filter((h2 : HexType) => IsNeighbor(hex, h2));
}

const ClearHighlightedHexes = function (G : any) {
    // Clear all other highlights
    G.map.forEach(mapHex => {
        mapHex.isHighlighted = false;
      });
}

export { FindHexInGameState, FindHexagonInBoard, Hexes, HexColor, IsNeighbor, GetNeighbors, FindHexagonWithToken , ClearHighlightedHexes}