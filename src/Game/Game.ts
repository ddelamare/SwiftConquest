import { INVALID_MOVE } from 'boardgame.io/core';
import { endIfCond } from './Game.endIf';
import { defaultOptions, GameOptions } from './Game.options';
import { Extend, UnwrapProxy } from '../Utils/Objects'
import { setupGame,  playerView } from './Game.setup';
import { TokenType } from '../Component/Token';
import { Stage } from 'boardgame.io/core';
import { FindElementById } from '../Helpers/Data/StateHelpers/Array';
import { HexType } from '../Component/Hex/Hex';
import { CreateUnitForPlayer, GetHexesWithDudes } from '../Helpers/Data/Units';

export function Game(options: GameOptions) {
  options = Extend(options, defaultOptions);
  console.table(options);

  return {
    setup: setupGame(options),
    turn: {
      minMoves: 1,
      maxMoves: 1,
    },
    phases: {
      actionDraft: {
        start: true,
        next: 'initialUnitPlacement',
        moves: {
          pickAction: ({ G, playerID, }, id) => {
            if (G.actionPool.length <= id) {
              return INVALID_MOVE;
            }

            var action: TokenType = UnwrapProxy(G.actionPool.splice(id, 1))[0];
            action.owner = playerID;
            var newPlayer = G.players[playerID];
            // Bypass local multiplayer double action bug
            if (!newPlayer.availableActions.some((elem) => elem.id === action.id)) {
              newPlayer.availableActions.push(action);
            }
          },
        },
        endIf: ({ G }) => (G.actionPool.length <= 0)
      },
      initialUnitPlacement:{
        next: 'mainPhase',
        moves: {
          placeDude: ({ G, playerID, player }, hexId) => {
            var hexElem : HexType = FindElementById(G.map, hexId);
            if (!hexElem || hexElem.units.length !== 0){
              return INVALID_MOVE;
            }
            hexElem.units.push(CreateUnitForPlayer(playerID));
          },
        },
        endIf: ({ G }) => (GetHexesWithDudes(G).length >= 12)
      },
      mainPhase: {
        turn: {
          activePlayers: { all: Stage.NULL },
        },
        moves: {
          selectToken: {
            move: ({ G, playerID }, id) => {
              var newPlayer = G.players[playerID];
              newPlayer.selectedToken = id;
            },
            redact: true,
            noLimit: true
          },
          placeToken: {
            move: ({ G, playerID }, hex) => {
              if (!G.players[playerID].selectedToken || !hex) {
                return INVALID_MOVE;
              }
              
              var hexElem : HexType = FindElementById(G.map, hex.id);
              var token = FindElementById(G.players[playerID].availableActions,G.players[playerID].selectedToken); 
              if (!hexElem || !token || hexElem.tokens.length > 0){
                return INVALID_MOVE;
              }

              hexElem.tokens.push(token);
              var tokenIdx = G.players[playerID].availableActions.indexOf(token);
              G.players[playerID].availableActions.splice(tokenIdx, 1);
            },
            redact: true,
            noLimit: true
          },
          clearToken: {
            move: ({ G, playerID }, tokenId, hexId) => {
              if (!tokenId) {
                return INVALID_MOVE;
              }
              var hexElem : HexType = FindElementById(G.map, hexId);
              var token : TokenType = FindElementById(hexElem.tokens, tokenId); 
              if (!hexElem || !token || hexElem.tokens.length === 0 || token.owner !== playerID){
                return INVALID_MOVE;
              }

              G.players[playerID].availableActions.push(token)
              var tokenIdx = hexElem.tokens.indexOf(token);
              hexElem.tokens.splice(tokenIdx, 1);
            },
            redact: true,
            noLimit: true
          }
        }
      }
    },
    moves: {
      clickCell: ({ G, playerID }, id) => {
        if (G.cells[id] !== null) {
          return INVALID_MOVE;
        }
        G.cells[id] = playerID;
      }
    },
    endIf: endIfCond,
    playerView: ({ G, ctx, playerID }) =>{ return playerView(G, ctx, playerID)},
  };
}

