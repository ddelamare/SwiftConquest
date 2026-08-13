import { Action, GameState } from '../Domain/Model';
import { findHex } from '../Domain/Selectors';

export function resolveCombat(G: GameState): boolean {
  const attackerID = G.attackerID;
  const targetHex = findHex(G, G.activeCombatHex);
  const sourceHex = findHex(G, G.attackerSourceHex);
  const attacker = attackerID ? G.players[attackerID] : undefined;
  if (!attackerID || !attacker || !targetHex || !sourceHex) return false;

  const defenderID = targetHex.units.find((unit) => unit.owner !== attackerID)?.owner ?? null;
  const defender = defenderID ? G.players[defenderID] : undefined;
  const attackerBid = attacker.bid ?? 0;
  const defenderBid = defender?.bid ?? 0;
  const attackerUnits = sourceHex.units.filter((unit) => unit.owner === attackerID);
  const defenderUnits = defenderID
    ? targetHex.units.filter((unit) => unit.owner === defenderID)
    : [];
  const hasDefendToken = Boolean(defenderID && targetHex.tokens.some(
    (token) => token.type === Action.Defend && token.owner === defenderID,
  ));

  attacker.gold -= attackerBid;
  if (defender) defender.gold -= defenderBid;

  const attackerStrength = attackerUnits.length + attackerBid;
  const defenderStrength = defenderUnits.length * (hasDefendToken ? 2 : 1) + defenderBid;
  if (attackerStrength >= defenderStrength) {
    const defeatedUnit = defenderID
      ? targetHex.units.findIndex((unit) => unit.owner === defenderID)
      : -1;
    if (defeatedUnit >= 0) targetHex.units.splice(defeatedUnit, 1);

    const defendersRemain = defenderID && targetHex.units.some((unit) => unit.owner === defenderID);
    if (!defendersRemain) {
      for (let index = sourceHex.units.length - 1; index >= 0; index -= 1) {
        if (sourceHex.units[index].owner === attackerID) {
          targetHex.units.push(sourceHex.units[index]);
          sourceHex.units.splice(index, 1);
        }
      }
    }
  } else {
    const defeatedUnit = sourceHex.units.findIndex((unit) => unit.owner === attackerID);
    if (defeatedUnit >= 0) sourceHex.units.splice(defeatedUnit, 1);
  }

  attacker.bid = null;
  if (defender) defender.bid = null;
  G.attackerID = null;
  G.activeCombatHex = null;
  G.attackerSourceHex = null;
  return true;
}

