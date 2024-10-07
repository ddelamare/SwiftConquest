import { Move } from "boardgame.io";
import { MovePropsType } from "./Game.types";
import { HexType } from "../Component/Hex/Hex";
import { GetUnitsForPlayer } from '../Helpers/Units';
import { FindElementById } from '../Utils/Array';
import { INVALID_MOVE } from 'boardgame.io/core';
import Token, { TokenType } from "../Component/Token";
import { ClearHighlightedHexes, FindHexagonWithToken, GetNeighbors } from "../Helpers/Hexes";
import { IsHexValidTargetForAction } from "../Helpers/Actions";

/* Token Actions */
export let selectToken: Move = {
  move: ({ G, playerID }: MovePropsType, id: string) => {
    var newPlayer = G.players[playerID];
    newPlayer.selectedToken = id;

    // Find any hexes with the token id.
    var hex = FindHexagonWithToken(G, id);
    if (hex) {
      var token: TokenType = FindElementById(hex.tokens, id)!;
      if (token.owner === playerID) {
        
        ClearHighlightedHexes(G);

        G.map.forEach(h => {
          if (IsHexValidTargetForAction(G, h, token)) {
            h.isHighlighted = true;
          }
        });
      }
    }

  },
  redact: true,
  noLimit: true
};

export let placeToken: Move = {
  move: ({ G, playerID }, hex) => {
    if (!G.players[playerID].selectedToken || !hex) {
      return INVALID_MOVE;
    }

    var hexElem: HexType = FindElementById(G.map, hex.id);
    var token = FindElementById(G.players[playerID].availableActions, G.players[playerID].selectedToken);
    if (!hexElem || !token || hexElem.tokens.length > 0 || GetUnitsForPlayer(hexElem, playerID).length === 0) {
      return INVALID_MOVE;
    }

    hexElem.tokens.push(token);
    var tokenIdx = G.players[playerID].availableActions.indexOf(token);
    G.players[playerID].availableActions.splice(tokenIdx, 1);
  },
  redact: true,
  noLimit: true
}

export let clearToken: Move = {
  move: ({ G, playerID }, tokenId, hexId) => {
    if (!tokenId) {
      return INVALID_MOVE;
    }
    var hexElem: HexType = FindElementById(G.map, hexId);
    var token: TokenType = FindElementById(hexElem.tokens, tokenId);
    if (!hexElem || !token || hexElem.tokens.length === 0 || token.owner !== playerID) {
      return INVALID_MOVE;
    }

    G.players[playerID].availableActions.push(token)
    var tokenIdx = hexElem.tokens.indexOf(token);
    hexElem.tokens.splice(tokenIdx, 1);
  },
  redact: true,
  noLimit: true
}

export let lockInTokens: Move = ({ G, ctx, events }: MovePropsType) => {
  // Removes players from the activePlayers list
  events!.endStage();
  if (ctx.activePlayers && Object.keys(ctx.activePlayers).length === 1) {
    console.log("All players have locked in their tokens");
    events.endPhase();
  }
}
/* End Token Actions */

/* Start Action Targeting */
export let selectTarget: Move = ({ G, ctx, events, playerID }: MovePropsType, hexOrId: HexType | string) => {
  var hex = typeof hexOrId === "string"? FindElementById(G.map, hexOrId) : hexOrId;
  if (!G.players[playerID].selectedToken || !hex) {
    return INVALID_MOVE;
  }

  var selectedTokenHex = FindHexagonWithToken(G, G.players[playerID].selectedToken);
  
  if (!selectedTokenHex) {
    return INVALID_MOVE;
  }

  var selectedToken: TokenType = FindElementById(selectedTokenHex.tokens, G.players[playerID].selectedToken);

  if (selectedTokenHex && IsHexValidTargetForAction(G, hex, selectedToken)) {
    //TODO: currently there is a bug where clicking on another players
    // Token while some hexes are highlighted puts the game into a weird state
    // Where the hexes are highlighted, but nothing is clickable because
    // the other player's token is selected.
    console.log("Attacked!");
  }
}

/* End Action Targeting */
export let lockInTarget: Move = ({ G, ctx, events }: MovePropsType) => { }


