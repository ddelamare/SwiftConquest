import { INVALID_MOVE } from 'boardgame.io/core';
import { PluginPlayer } from 'boardgame.io/plugins';
import { endIfCond } from './Game.endIf';
import { defaultOptions, GameOptions } from './Game.options';
import { Extend } from '../Utils/Objects'
import { setupGame, playerSetup, playerView } from './Game.setup';



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
            console.log(playerID);
            if (G.actionPool.length <= id) {
              return INVALID_MOVE;
            }
            var action = G.actionPool.splice(id,1);
            var newPlayer = structuredClone(player.get());
            newPlayer.availableActions.push(action);
            
            player.set(newPlayer)
          },
        },
        endIf: ({G}) => (G.actionPool.length <= 0)
      },
      actionDraft: {
        next: 'mainPhase',
        moves: {}
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

