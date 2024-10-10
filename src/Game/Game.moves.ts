import { Move } from "boardgame.io";
import { MovePropsType } from "./Game.types";
import { HexType } from "../Component/Hex/Hex";
import { GetUnitsForPlayer } from '../Helpers/Units';
import { FindElementById } from '../Utils/Array';
import { INVALID_MOVE } from 'boardgame.io/core';
import Token, { TokenType } from "../Component/Token";
import { ClearHighlightedHexes, FindHexagonWithToken, GetNeighbors } from "../Helpers/Hexes";
import Action, { IsHexValidTargetForAction } from "../Helpers/Actions";
import { FindTokenInMap } from "../Helpers/Tokens";

/* Token Actions */
export let selectToken: Move = {
  move: ({ G, playerID }: MovePropsType, id: string) => {
    var newPlayer = G.players[playerID];
    newPlayer.selectedToken = id;

    // Find any hexes with the token id.
    var hex = FindHexagonWithToken(G, id);
    if (hex) {
      var actionToken: TokenType = FindElementById(hex.tokens, id)!;
      if (actionToken.owner === playerID) {

        ClearHighlightedHexes(G);

        G.map.forEach(h => {
          if (IsHexValidTargetForAction(G, h, actionToken)) {
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
  var hex = typeof hexOrId === "string" ? FindElementById(G.map, hexOrId) : hexOrId;
  if (!G.players[playerID].selectedToken || !hex) {
    return INVALID_MOVE;
  }

  var selectedTokenHex = FindHexagonWithToken(G, G.players[playerID].selectedToken);

  if (!selectedTokenHex) {
    return INVALID_MOVE;
  }

  var selectedToken: TokenType = FindElementById(selectedTokenHex.tokens, G.players[playerID].selectedToken);

  if (selectedTokenHex && IsHexValidTargetForAction(G, hex, selectedToken)) {
    ClearHighlightedHexes(G);
    // Refetch the ref so highlighting works
    FindElementById(G.map, hex.id).isHighlighted = true;
    G.activeCombatHex = hex.id;  
  }
}

/* End Action Targeting */
export let lockInTarget: Move = ({ G, ctx, events, playerID }: MovePropsType) => {

  if (!G.activeCombatHex || !G.players[playerID].selectedToken) {
    return INVALID_MOVE;
  }

  // Validate that the targeted hex is acceptable
  var hex = FindElementById(G.map, G.activeCombatHex);
  var action = FindTokenInMap(G, G.players[playerID].selectedToken);
  if (!IsHexValidTargetForAction(G, hex, action)) {
    return INVALID_MOVE;
  }

  // Calculate and find all players who have nearby aid tokens.
  var targetNeighbors = GetNeighbors(G, hex);
  var sourceHex = FindHexagonWithToken(G, action.id)!;
  var sourceNeighbors = GetNeighbors(G, sourceHex);
  // Finds all nearby aid tokens except for on the hex being attacked
  var validAidTokens = targetNeighbors.concat(sourceNeighbors).filter((h) => h.id != G.activeCombatHex).flatMap((h) => h.tokens).filter(t => t.type == Action.Aid);
  // Generates the next phase map based on who has aid tokens nearby
  var stateMap = validAidTokens.reduce<any>((prev, token, idx, arr) => { prev[token.owner || ""] = "aidSelection"; return prev;}, {})
  events.setActivePlayers({
    value: stateMap
  });
}


