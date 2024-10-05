import { INVALID_MOVE } from 'boardgame.io/core';
import { endIfCond } from './Game.endIf';
import { defaultOptions, GameOptions } from './Game.options';
import { Extend, UnwrapProxy } from '../Utils/Objects'
import { setupGame, playerView } from './Game.setup';
import { TokenType } from '../Component/Token';
import { Stage } from 'boardgame.io/core';
import { FindElementById } from '../Helpers/Data/StateHelpers/Array';
import { HexType } from '../Component/Hex/Hex';
import { CreateUnitForPlayer, GetHexesWithDudes } from '../Helpers/Data/Units';
import { MovePropsType } from './Game.types';
import * as Moves from './Game.moves'

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
          pickAction: ({ G, playerID, }: MovePropsType, id) => {
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
        endIf: ({ G }: MovePropsType) => (G.actionPool.length <= 0)
      },
      initialUnitPlacement: {
        next: 'actionPlacementPhase',
        moves: {
          placeDude: ({ G, playerID }: MovePropsType, hexId) => {
            var hexElem: HexType = FindElementById(G.map, hexId);
            if (!hexElem || hexElem.units.length !== 0) {
              return INVALID_MOVE;
            }
            hexElem.units.push(CreateUnitForPlayer(playerID));
          },
        },
        endIf: ({ G }) => (GetHexesWithDudes(G).length >= 12)
      },
      actionPlacementPhase: {
        next: 'actionResolutionPhase',
        turn: {
          activePlayers: { all: Stage.NULL, minMoves: 1, maxMoves: 1 },
        },
        moves: {
          selectToken: Moves.selectToken,
          placeToken: Moves.placeToken,
          clearToken: Moves.clearToken,
          lockInTokens: Moves.lockInTokens
        }
      },
      actionResolutionPhase: {

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
    playerView: ({ G, ctx, playerID }) => { return playerView(G, ctx, playerID) },
  };
}

