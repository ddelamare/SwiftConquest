export type PlayerID = string;

export enum Action {
  Unknown = 0,
  Attack,
  Defend,
  Gather,
  Aid,
}

export enum HexTerrain {
  Standard = 'standard',
  Keep = 'keep',
  Mine = 'mine',
}

export interface HexCoordinate {
  q: number;
  r: number;
  s: number;
}

export interface ActionToken {
  id: string;
  type: Action;
  owner: PlayerID | null;
  rank: number | null;
}

export interface UnitState {
  id: string;
  owner: PlayerID;
}

export interface HexState {
  id: string;
  tokens: ActionToken[];
  units: UnitState[];
  type: HexTerrain;
  tile: HexCoordinate;
}

export interface PlayerState {
  availableActions: ActionToken[];
  selectedToken: string | null;
  gold: number;
  gems: number;
  /** A committed secret bid. Uncommitted input remains local to the client. */
  bid: number | null;
}

export interface GameState {
  map: HexState[];
  actionPool: ActionToken[];
  players: Record<PlayerID, PlayerState>;
  activeCombatHex: string | null;
  attackerID: PlayerID | null;
  attackerSourceHex: string | null;
  round: number;
  nextUnitSequence: number;
}

export const Phase = {
  ActionDraft: 'actionDraft',
  InitialUnitPlacement: 'initialUnitPlacement',
  ActionPlacement: 'actionPlacementPhase',
  AttackResolution: 'attackResolutionPhase',
  Income: 'incomePhase',
  Reset: 'resetPhase',
} as const;

export const Stage = {
  AttackSelection: 'attackSelection',
  AidSelection: 'aidSelection',
  BidSelection: 'bidSelection',
  AttackResolution: 'attackResolution',
} as const;

