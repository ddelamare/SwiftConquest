import type { Ctx } from 'boardgame.io';
import { createBoard, createDraftPool, createPlayer } from '../Domain/BoardDefinition';
import { Action, GameState, PlayerState } from '../Domain/Model';
import type { GameOptions } from './Game.options';

export type GameStateType = GameState;
export type PlayerData = PlayerState;

export function setupGame(_options: GameOptions) {
  return ({ ctx }: { ctx: Ctx }): GameState => {
    const players: Record<string, PlayerState> = {};
    for (let index = 0; index < ctx.numPlayers; index += 1) {
      const playerID = String(index);
      players[playerID] = createPlayer(playerID);
    }

    return {
      map: createBoard(),
      actionPool: createDraftPool(1),
      players,
      activeCombatHex: null,
      attackerID: null,
      attackerSourceHex: null,
      round: 1,
      nextUnitSequence: 0,
    };
  };
}

/**
 * Produce the peer-specific synchronized view. Committed secret state stays in G
 * so it is authoritative and replayable, but is masked before reaching opponents.
 */
export function playerView({ G, ctx, playerID }: { G: GameState; ctx: Ctx; playerID: string | null }): GameState {
  const visiblePlayers: Record<string, PlayerState> = {};
  for (const [id, player] of Object.entries(G.players)) {
    if (id === playerID) {
      visiblePlayers[id] = player;
      continue;
    }

    visiblePlayers[id] = {
      ...player,
      selectedToken: null,
      bid: null,
      availableActions: player.availableActions.map((token) => ({
        ...token,
        type: Action.Unknown,
      })),
    };
  }

  const visibleMap = G.map.map((hex) => ({
    ...hex,
    tokens: hex.tokens.map((token) => ({
      ...token,
      type: playerID === token.owner || ctx.phase === 'attackResolutionPhase'
        ? token.type
        : Action.Unknown,
    })),
  }));

  return { ...G, map: visibleMap, players: visiblePlayers };
}
