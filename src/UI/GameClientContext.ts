import { createContext } from 'react';
import type { Ctx } from 'boardgame.io';
import type { GameState } from '../Domain/Model';

export interface GameClientContextValue {
  G: GameState;
  ctx: Ctx;
  moves: Record<string, (...args: any[]) => void>;
  playerID: string | null;
}

export const GameClientContext = createContext<GameClientContextValue | null>(null);

