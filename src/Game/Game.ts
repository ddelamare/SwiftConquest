import { INVALID_MOVE } from 'boardgame.io/core';
import { PluginPlayer } from 'boardgame.io/plugins';
import { endIfCond } from './Game.endIf';
import { defaultOptions, GameOptions } from './Game.options';
import { Extend, UnwrapProxy } from '../Utils/Objects'
import { setupGame, playerSetup, playerView } from './Game.setup';
import { TokenType } from '../Component/Token';


export function Game(options : GameOptions) {
  options = Extend(options, defaultOptions);
  console.table(options);

  return {
    setup: setupGame(options),
    turn: {
        minMoves: 1,
        maxMoves: 1,
      },
    phases:{
      boardSetup: {
        start: true,
        next: 'actionDraft',
        moves: {
          pickAction: ({G, playerID, player}, id) => {
            if (G.actionPool.length <= id) {
              return INVALID_MOVE;
            }

            var action : TokenType = UnwrapProxy(G.actionPool.splice(id,1))[0];
            action.owner = playerID;
            var newPlayer = player.get();
            // Bypass local multiplayer double action bug
            if (!newPlayer.availableActions.some((elem) => elem.id === action.id)){
              newPlayer.availableActions.push(action);
            }
          },
        },
        endIf: ({G}) => (G.actionPool.length <= 0)
      },
      actionDraft: {
        next: 'mainPhase',
        moves: {
          selectToken: {
            move: ({G, player}, id) => {
              var newPlayer = player.get();
              newPlayer.selectedToken = id;
            },
            redact: true,
            noLimit: true
          },
          placeToken: ({G, playerID, player}, id) => {
            if (!player.get().selectedToken) {
              return INVALID_MOVE;
            }
            console.log("Placing token on hex", id);
          }
        }
      },
      mainPhase: {}
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
  };
}

