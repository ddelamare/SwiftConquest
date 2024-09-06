import { INVALID_MOVE } from 'boardgame.io/core';
import { PluginPlayer } from 'boardgame.io/plugins';
import { endIfCond } from './Game.endIf';
import { defaultOptions, GameOptions } from './Game.options';
import { Extend, UnwrapProxy } from '../Utils/Objects'
import { setupGame, playerSetup, playerView } from './Game.setup';
import { TokenType } from '../Component/Token';
import { Stage } from 'boardgame.io/core';
import { FindElementById } from '../Helpers/Data/StateHelpers/Array';
import { HexType } from '../Component/Hex/Hex';

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
        next: 'mainPhase',
        moves: {
          pickAction: ({ G, playerID, player }, id) => {
            if (G.actionPool.length <= id) {
              return INVALID_MOVE;
            }

            var action: TokenType = UnwrapProxy(G.actionPool.splice(id, 1))[0];
            action.owner = playerID;
            var newPlayer = player.get();
            // Bypass local multiplayer double action bug
            if (!newPlayer.availableActions.some((elem) => elem.id === action.id)) {
              newPlayer.availableActions.push(action);
            }
          },
        },
        endIf: ({ G }) => (G.actionPool.length <= 0)
      },
      mainPhase: {
        next: 'mainPhase',
        turn: {
          activePlayers: { all: Stage.NULL },
        },
        moves: {
          selectToken: {
            move: ({ G, player, playerID }, id) => {
              var newPlayer = player.state[playerID];
              newPlayer.selectedToken = id;
            },
            redact: true,
            noLimit: true
          },
          placeToken: {
            move: ({ G, playerID, player }, hex) => {
              if (!player.state[playerID].selectedToken || !hex) {
                return INVALID_MOVE;
              }
              
              var hexElem : HexType = FindElementById(G.map, hex.id);
              var token = FindElementById(player.state[playerID].availableActions,player.state[playerID].selectedToken); 
              if (!hexElem || !token || hexElem.tokens.length > 0){
                return INVALID_MOVE;
              }

              hexElem.tokens.push(token);
              var tokenIdx = player.state[playerID].availableActions.indexOf(token);
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
    plugins: [
      // pass your function to the player plugin
      PluginPlayer({
        setup: playerSetup,
        playerView: playerView,
      }),
    ],
    endIf: endIfCond,
    playerView: ({ G, ctx, playerID }) =>{ return  {...G, playerID }},
  };
}

