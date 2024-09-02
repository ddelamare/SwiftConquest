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

