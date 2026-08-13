import type { GameState } from '../Domain/Model';
import { findTokenOnMap } from '../Domain/Selectors';

export const FindTokenInMap = (G: GameState, id: string | null) => findTokenOnMap(G, id);
