import { ActivePlayers, INVALID_MOVE } from 'boardgame.io/core';
import { endIfCond } from './Game.endIf';
import { defaultOptions, GameOptions } from './Game.options';
import { Extend, UnwrapProxy } from '../Utils/Objects'
import { setupGame, playerView } from './Game.setup';
import { TokenType } from '../Component/Token';
import { Stage } from 'boardgame.io/core';
import { FindElementById } from '../Utils/Array';
import { HexType } from '../Component/Hex/Hex';
import { CreateUnitForPlayer, GetHexesWithDudes } from '../Helpers/Units';
import { MovePropsType } from './Game.types';
import * as Moves from './Game.moves'
import { TurnConfig } from 'boardgame.io';

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
        next: 'attackResolutionPhase',
        turn: {
          // Make all players active and wait until all players have made a move
          activePlayers: ActivePlayers.ALL_ONCE,
        },
        moves: {
          selectToken: Moves.selectToken,
          placeToken: Moves.placeToken,
          clearToken: Moves.clearToken,
          lockInTokens: Moves.lockInTokens
        }
      },
      attackResolutionPhase: {
        next:'incomePhase',
        moves: {},
        turn: {
          activePlayers: {
            currentPlayer: 'attackSelection'
          },
          stages: {
            attackSelection: {
              moves: {
                selectToken: Moves.selectToken,
                selectTarget: Moves.selectTarget,
                lockInTarget: Moves.lockInTarget
              },
              next:'aidSelection'
            },
            aidSelection: {
              moves: {},
              next:'bidSelection'
            },
            bidSelection: {
              moves: {},
              next:'attackResolution'
            },
            attackResolution: {
              moves: {}
            }
          }
        } satisfies TurnConfig
      },
      incomePhase:{
        next:'resetPhase',
        moves: {},
      },
      resetPhase:{
        moves: {},
      }
    },
    endIf: endIfCond,
    playerView: playerView,
  };
}

