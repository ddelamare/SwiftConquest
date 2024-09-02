import { INVALID_MOVE } from 'boardgame.io/core';
import { endIfCond } from './Game.endIf';
import { defaultOptions, GameOptions } from './Game.options';
import { Extend } from '../Utils/Objects'
import setupGame from './Game.setup';
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
    endIf: endIfCond,
  };
}

