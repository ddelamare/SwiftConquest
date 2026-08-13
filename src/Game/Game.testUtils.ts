import type { Ctx } from 'boardgame.io';
import { Action, GameState } from '../Domain/Model';
import { isNeighbor } from '../Domain/Selectors';
import { defaultOptions } from './Game.options';
import { setupGame } from './Game.setup';

export function createTestContext(overrides: Partial<Ctx> = {}): Ctx {
  return {
    numPlayers: 2,
    phase: 'actionPlacementPhase',
    currentPlayer: '0',
    activePlayers: null,
    turn: 1,
    numMoves: 0,
    playOrder: ['0', '1'],
    playOrderPos: 0,
    ...overrides,
  } as Ctx;
}

export function createTestGame(numPlayers = 2): GameState {
  return setupGame(defaultOptions)({ ctx: createTestContext({ numPlayers }) });
}

export function createEvents() {
  return {
    endPhase: jest.fn(),
    endStage: jest.fn(),
    setActivePlayers: jest.fn(),
  };
}

export function cloneGameState(G: GameState): GameState {
  return JSON.parse(JSON.stringify(G)) as GameState;
}

export function placeOwnedAction(G: GameState, playerID: string, actionType: Action, hexIndex = 0) {
  const player = G.players[playerID];
  const token = player.availableActions.find((candidate) => candidate.type === actionType)!;
  player.availableActions.splice(player.availableActions.indexOf(token), 1);
  G.map[hexIndex].tokens.push(token);
  player.selectedToken = token.id;
  return { token, hex: G.map[hexIndex] };
}

export function adjacentHexIndex(G: GameState, sourceIndex: number): number {
  return G.map.findIndex((hex, index) => index !== sourceIndex && isNeighbor(G.map[sourceIndex], hex));
}

export function prepareCombat(G: GameState, options: {
  attackerUnits?: number;
  defenderUnits?: number;
  attackerBid?: number;
  defenderBid?: number;
  defend?: boolean;
} = {}) {
  const sourceIndex = 0;
  const targetIndex = adjacentHexIndex(G, sourceIndex);
  const source = G.map[sourceIndex];
  const target = G.map[targetIndex];
  const attackerUnits = options.attackerUnits ?? 1;
  const defenderUnits = options.defenderUnits ?? 1;

  source.units = Array.from({ length: attackerUnits }, (_, index) => ({ id: `attacker:${index}`, owner: '0' }));
  target.units = Array.from({ length: defenderUnits }, (_, index) => ({ id: `defender:${index}`, owner: '1' }));
  const { token } = placeOwnedAction(G, '0', Action.Attack, sourceIndex);
  if (options.defend) {
    target.tokens.push({ id: 'defend:test', type: Action.Defend, owner: '1', rank: null });
  }

  G.attackerID = '0';
  G.attackerSourceHex = source.id;
  G.activeCombatHex = target.id;
  G.players['0'].selectedToken = token.id;
  G.players['0'].bid = options.attackerBid ?? 0;
  G.players['1'].bid = options.defenderBid ?? 0;
  return { source, target, token };
}
