import type { GameState } from '../Domain/Model';

const GEM_WIN_THRESHOLD = 10;
const GOLD_WIN_THRESHOLD = 30;

export function endIfCond({ G }: { G: GameState }) {
  for (const playerID of Object.keys(G.players)) {
    const player = G.players[playerID];
    if (player.gems >= GEM_WIN_THRESHOLD) {
      return { winner: playerID };
    }
    if (player.gold >= GOLD_WIN_THRESHOLD) {
      return { winner: playerID };
    }
  }
  return false;
}

