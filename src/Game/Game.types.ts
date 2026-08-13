import type { Ctx } from 'boardgame.io';
import type { GameState } from '../Domain/Model';

export interface GameEvents {
  endPhase(): void;
  endStage(): void;
  setActivePlayers(args: { value: Record<string, string> }): void;
}

export interface MovePropsType {
  G: GameState;
  ctx: Ctx;
  events: GameEvents;
  playerID: string;
}
