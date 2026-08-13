import { ActivePlayers } from 'boardgame.io/core';
import type { TurnConfig } from 'boardgame.io';
import { Phase, Stage } from '../Domain/Model';
import { hexesWithUnits } from '../Domain/Selectors';
import { endIfCond } from './Game.endIf';
import { awardIncome, resetRound } from './Game.lifecycle';
import * as Moves from './Game.moves';
import { defaultOptions, GameOptions } from './Game.options';
import { playerView, setupGame } from './Game.setup';

export function Game(options: Partial<GameOptions> = {}) {
  const resolvedOptions: GameOptions = { ...defaultOptions, ...options };

  return {
    setup: setupGame(resolvedOptions),
    turn: { minMoves: 1, maxMoves: 1 },
    phases: {
      [Phase.ActionDraft]: {
        start: true,
        next: Phase.InitialUnitPlacement,
        moves: { pickAction: Moves.pickAction },
        endIf: ({ G }) => G.actionPool.length === 0,
      },
      [Phase.InitialUnitPlacement]: {
        next: Phase.ActionPlacement,
        moves: { placeDude: Moves.placeUnit },
        endIf: ({ G }) => hexesWithUnits(G).length >= 12,
      },
      [Phase.ActionPlacement]: {
        next: Phase.AttackResolution,
        turn: { activePlayers: ActivePlayers.ALL_ONCE },
        moves: {
          selectToken: Moves.selectToken,
          placeToken: Moves.placeToken,
          clearToken: Moves.clearToken,
          lockInTokens: Moves.lockInTokens,
        },
      },
      [Phase.AttackResolution]: {
        next: Phase.Income,
        moves: {},
        turn: {
          activePlayers: { currentPlayer: Stage.AttackSelection },
          stages: {
            [Stage.AttackSelection]: {
              moves: {
                selectToken: Moves.selectToken,
                selectTarget: Moves.selectTarget,
                lockInTarget: Moves.lockInTarget,
              },
              next: Stage.AidSelection,
            },
            [Stage.AidSelection]: {
              moves: { selectToken: Moves.selectToken },
              next: Stage.BidSelection,
            },
            [Stage.BidSelection]: {
              moves: { submitBid: Moves.submitBid },
              next: Stage.AttackResolution,
            },
            [Stage.AttackResolution]: { moves: {} },
          },
        } satisfies TurnConfig,
      },
      [Phase.Income]: {
        next: Phase.Reset,
        moves: {},
        onBegin: awardIncome,
      },
      [Phase.Reset]: {
        next: Phase.ActionDraft,
        moves: {},
        onBegin: resetRound,
      },
    },
    endIf: endIfCond,
    playerView,
  };
}

