import { INVALID_MOVE } from 'boardgame.io/core';
import { endIfCond } from './Game.endIf';
import { defaultOptions } from './Game.options';
import { Extend } from '../Utils/Objects'
const Game = function(options) {

  options = Extend(options, defaultOptions);
  console.table(options);
  return {
    setup: () => ({ cells: Array(9).fill(null) }),
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

export default Game;
