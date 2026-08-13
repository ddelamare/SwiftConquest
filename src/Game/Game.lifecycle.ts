import { createDraftPool } from '../Domain/BoardDefinition';
import { Action, GameState, HexTerrain } from '../Domain/Model';
import { controllingPlayer } from '../Domain/Selectors';

export function awardIncome({ G }: { G: GameState }): void {
  for (const hex of G.map) {
    if (hex.type !== HexTerrain.Mine) continue;
    const controllerID = controllingPlayer(hex);
    const controller = controllerID ? G.players[controllerID] : undefined;
    if (!controller) continue;

    controller.gold += 1;
    if (hex.tokens.some((token) => token.type === Action.Gather && token.owner === controllerID)) {
      controller.gems += 1;
    }
  }
}

export function resetRound({ G }: { G: GameState }): void {
  for (const hex of G.map) {
    for (const token of hex.tokens) {
      if (token.owner && G.players[token.owner]) {
        G.players[token.owner].availableActions.push(token);
      }
    }
    hex.tokens = [];
  }

  G.round += 1;
  G.actionPool = createDraftPool(G.round);
  G.activeCombatHex = null;
  G.attackerID = null;
  G.attackerSourceHex = null;
  for (const player of Object.values(G.players)) {
    player.bid = null;
    player.selectedToken = null;
  }
}

