import { ActivePlayers, INVALID_MOVE } from 'boardgame.io/core';
import { endIfCond } from './Game.endIf';
import { defaultOptions, GameOptions } from './Game.options';
import { Extend, GetUniqueId, UnwrapProxy } from '../Utils/Objects'
import { setupGame, playerView } from './Game.setup';
import { TokenType } from '../Component/Token';
import { FindElementById } from '../Utils/Array';
import { HexType } from '../Component/Hex/Hex';
import { CreateUnitForPlayer, GetHexesWithDudes } from '../Helpers/Units';
import { MovePropsType } from './Game.types';
import * as Moves from './Game.moves'
import { TurnConfig } from 'boardgame.io';
import Action from '../Helpers/Actions';
import { Hexes } from '../Helpers/Hexes';

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
              moves: {
                selectToken: Moves.selectToken,
              },
              next:'bidSelection'
            },
            bidSelection: {
              moves: {
                setPendingBid: Moves.setPendingBid,
                submitBid: Moves.submitBid
              },
              next:'attackResolution'
            },
            attackResolution: {
              moves: {}
            }
          }
        } satisfies TurnConfig
      },
      incomePhase: {
        next: 'resetPhase',
        moves: {},
        onBegin: ({ G }) => {
          // Award income for each mine hex that is uncontested
          G.map.forEach((hex: HexType) => {
            if (hex.type !== Hexes.Mine) return;
            // A mine is controlled when exactly one player has units there
            const owners = hex.units.map(u => u.owner as string);
            const uniqueOwners = Array.from(new Set(owners));
            if (uniqueOwners.length !== 1) return;
            const controllerID = uniqueOwners[0];
            if (!G.players[controllerID]) return;

            // Basic mine income: +1 gold per round
            G.players[controllerID].gold += 1;

            // Gem income: +1 gem only when the player has a Gather token on this mine
            const hasGather = hex.tokens.some(
              (t: TokenType) => t.type === Action.Gather && t.owner === controllerID
            );
            if (hasGather) {
              G.players[controllerID].gems += 1;
            }
          });
        }
      },
      resetPhase: {
        next: 'actionDraft',
        moves: {},
        onBegin: ({ G }) => {
          // Return all tokens from the map back to their owner's hand
          G.map.forEach((hex: HexType) => {
            while (hex.tokens.length > 0) {
              const token: TokenType = hex.tokens.pop()!;
              if (token.owner !== null && G.players[token.owner]) {
                G.players[token.owner].availableActions.push(token);
              }
            }
          });

          // Recreate the shared action pool with four fresh tokens
          G.actionPool.splice(0, G.actionPool.length);
          G.actionPool.push(
            { id: GetUniqueId(), type: Action.Attack, owner: null, rank: null },
            { id: GetUniqueId(), type: Action.Defend, owner: null, rank: null },
            { id: GetUniqueId(), type: Action.Gather, owner: null, rank: null },
            { id: GetUniqueId(), type: Action.Aid, owner: null, rank: null }
          );

          // Clear per-round combat and selection state
          G.activeCombatHex = null;
          G.attackerID = null;
          G.attackerSourceHex = null;
          Object.keys(G.players).forEach(pid => {
            G.players[pid].bid = null;
            G.players[pid].pendingBid = 0;
            G.players[pid].selectedToken = null;
          });

          // Clear hex highlights
          G.map.forEach((hex: HexType) => { hex.isHighlighted = false; });
        }
      }
    },
    endIf: endIfCond,
    playerView: playerView,
  };
}

