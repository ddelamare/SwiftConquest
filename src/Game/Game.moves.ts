import { Move } from "boardgame.io";
import { MovePropsType } from "./Game.types";
import { HexType } from "../Component/Hex/Hex";
import { GetUnitsForPlayer } from '../Helpers/Data/Units';
import { FindElementById } from '../Helpers/Data/StateHelpers/Array';
import { INVALID_MOVE } from 'boardgame.io/core';
import { TokenType } from "../Component/Token";

/* Token Actions */
export let selectToken: Move = {
    move: ({ G, playerID }: MovePropsType, id: string) => {
        var newPlayer = G.players[playerID];
        newPlayer.selectedToken = id;
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

export let clearToken : Move = {
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

  export let lockInTokens : Move = ({ G, ctx, events } : MovePropsType) => {
    events!.endStage();
    if (ctx.activePlayers && Object.keys(ctx.activePlayers).length === 1) {
      console.log("All players have locked in their tokens");
      events.endPhase();
    }
  }
/* End Token Actions */