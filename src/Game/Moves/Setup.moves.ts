import { INVALID_MOVE } from 'boardgame.io/core';
import { findHex } from '../../Domain/Selectors';
import type { ActionToken, UnitState } from '../../Domain/Model';
import type { MovePropsType } from '../Game.types';

export function pickAction({ G, playerID }: MovePropsType, poolIndex: number) {
  const player = G.players[playerID];
  if (!player || !Number.isInteger(poolIndex) || poolIndex < 0 || poolIndex >= G.actionPool.length) {
    return INVALID_MOVE;
  }

  const [drafted] = G.actionPool.splice(poolIndex, 1);
  const ownedToken: ActionToken = { ...drafted, owner: playerID };
  player.availableActions.push(ownedToken);
}

export function placeUnit({ G, playerID }: MovePropsType, hexID: string) {
  const player = G.players[playerID];
  const hex = findHex(G, hexID);
  if (!player || !hex || hex.units.length !== 0) return INVALID_MOVE;

  const unit: UnitState = {
    id: `unit:${G.nextUnitSequence}`,
    owner: playerID,
  };
  G.nextUnitSequence += 1;
  hex.units.push(unit);
}

