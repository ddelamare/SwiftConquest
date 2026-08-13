import { Move } from "boardgame.io";
import { MovePropsType } from "./Game.types";
import { HexType } from "../Component/Hex/Hex";
import { GetUnitsForPlayer } from '../Helpers/Units';
import { FindElementById } from '../Utils/Array';
import { INVALID_MOVE } from 'boardgame.io/core';
import { TokenType } from "../Component/Token";
import { ClearHighlightedHexes, FindHexagonWithToken } from "../Helpers/Hexes";
import Action, { IsHexValidTargetForAction } from "../Helpers/Actions";
import { FindTokenInMap } from "../Helpers/Tokens";
import { GameStateType } from "./Game.setup";

/* --- Combat resolution helper --- */

function resolveCombat(G: GameStateType) {
  const attackerID = G.attackerID;
  if (!attackerID || !G.activeCombatHex || !G.attackerSourceHex) return;

  const targetHex: HexType = FindElementById(G.map, G.activeCombatHex);
  const sourceHex: HexType = FindElementById(G.map, G.attackerSourceHex);
  if (!targetHex || !sourceHex) return;

  // Defender: first unit owner on the target hex that is not the attacker
  const defenderID: string | null = targetHex.units.find(u => u.owner !== attackerID)?.owner ?? null;

  if (!G.players[attackerID]) return;

  // Calculate combat strengths
  const attackerBid = G.players[attackerID].bid ?? 0;
  const attackerUnits = sourceHex.units.filter(u => u.owner === attackerID).length;
  const attackerStrength = attackerUnits + attackerBid;

  const defenderBid = defenderID ? (G.players[defenderID]?.bid ?? 0) : 0;
  const defenderUnits = defenderID ? targetHex.units.filter(u => u.owner === defenderID).length : 0;
  const hasDefendToken = defenderID !== null &&
    targetHex.tokens.some((t: TokenType) => t.type === Action.Defend && t.owner === defenderID);
  const defenderStrength = (defenderUnits * (hasDefendToken ? 2 : 1)) + defenderBid;

  // Deduct bids from gold (bids are spent regardless of outcome)
  G.players[attackerID].gold = Math.max(0, G.players[attackerID].gold - attackerBid);
  if (defenderID && G.players[defenderID]) {
    G.players[defenderID].gold = Math.max(0, G.players[defenderID].gold - defenderBid);
  }

  // >= ensures ties favor the attacker (passive defense is never the dominant strategy)
  if (attackerStrength >= defenderStrength) {
    // Attacker wins: move all attacker units to target hex
    for (let i = sourceHex.units.length - 1; i >= 0; i--) {
      if (sourceHex.units[i].owner === attackerID) {
        targetHex.units.push(sourceHex.units[i]);
        sourceHex.units.splice(i, 1);
      }
    }
    // Defender loses one unit
    if (defenderID) {
      const defIdx = targetHex.units.findIndex(u => u.owner === defenderID);
      if (defIdx !== -1) targetHex.units.splice(defIdx, 1);
    }
  } else {
    // Defender wins: attacker loses one unit from source hex
    const atkIdx = sourceHex.units.findIndex(u => u.owner === attackerID);
    if (atkIdx !== -1) sourceHex.units.splice(atkIdx, 1);
  }

  // Clear per-round combat state
  G.players[attackerID].bid = null;
  G.players[attackerID].pendingBid = 0;
  if (defenderID && G.players[defenderID]) {
    G.players[defenderID].bid = null;
    G.players[defenderID].pendingBid = 0;
  }
  G.attackerID = null;
  G.activeCombatHex = null;
  G.attackerSourceHex = null;
}

/* Token Actions */
export let selectToken: Move = {
  move: ({ G, playerID }: MovePropsType, id: string) => {
    var newPlayer = G.players[playerID];
    newPlayer.selectedToken = id;

    // Find any hexes with the token id.
    var hex = FindHexagonWithToken(G, id);
    if (hex) {
      var actionToken: TokenType = FindElementById(hex.tokens, id)!;
      if (actionToken.owner === playerID) {

        ClearHighlightedHexes(G);

        G.map.forEach(h => {
          if (IsHexValidTargetForAction(G, h, actionToken)) {
            h.isHighlighted = true;
          }
        });
      }
    }

  },
  redact: true,
  noLimit: true
};

export let placeToken: Move = {
  move: ({ G, playerID }, hex) => {
    if (!G.players[playerID].selectedToken || !hex) {
      return INVALID_MOVE;
    }

    var hexElem: HexType = FindElementById(G.map, hex.id);
    var token = FindElementById(G.players[playerID].availableActions, G.players[playerID].selectedToken);
    if (!hexElem || !token || hexElem.tokens.length > 0 || GetUnitsForPlayer(hexElem, playerID).length === 0) {
      return INVALID_MOVE;
    }

    hexElem.tokens.push(token);
    var tokenIdx = G.players[playerID].availableActions.indexOf(token);
    G.players[playerID].availableActions.splice(tokenIdx, 1);
  },
  redact: true,
  noLimit: true
}

export let clearToken: Move = {
  move: ({ G, playerID }, tokenId, hexId) => {
    if (!tokenId) {
      return INVALID_MOVE;
    }
    var hexElem: HexType = FindElementById(G.map, hexId);
    var token: TokenType = FindElementById(hexElem.tokens, tokenId);
    if (!hexElem || !token || hexElem.tokens.length === 0 || token.owner !== playerID) {
      return INVALID_MOVE;
    }

    G.players[playerID].availableActions.push(token)
    var tokenIdx = hexElem.tokens.indexOf(token);
    hexElem.tokens.splice(tokenIdx, 1);
  },
  redact: true,
  noLimit: true
}

export let lockInTokens: Move = ({ G, ctx, events }: MovePropsType) => {
  // Removes players from the activePlayers list
  events!.endStage();
  if (ctx.activePlayers && Object.keys(ctx.activePlayers).length === 1) {
    console.log("All players have locked in their tokens");
    events.endPhase();
  }
}
/* End Token Actions */

/* Start Action Targeting */
export let selectTarget: Move = ({ G, ctx, events, playerID }: MovePropsType, hexOrId: HexType | string) => {
  var hex = typeof hexOrId === "string" ? FindElementById(G.map, hexOrId) : hexOrId;
  if (!G.players[playerID].selectedToken || !hex) {
    return INVALID_MOVE;
  }

  var selectedTokenHex = FindHexagonWithToken(G, G.players[playerID].selectedToken);

  if (!selectedTokenHex) {
    return INVALID_MOVE;
  }

  var selectedToken: TokenType = FindElementById(selectedTokenHex.tokens, G.players[playerID].selectedToken);

  if (selectedTokenHex && IsHexValidTargetForAction(G, hex, selectedToken)) {
    ClearHighlightedHexes(G);
    // Refetch the ref so highlighting works
    FindElementById(G.map, hex.id).isHighlighted = true;
    G.activeCombatHex = hex.id;  
  }
}

/* End Action Targeting */
export let lockInTarget: Move = ({ G, ctx, events, playerID }: MovePropsType) => {

  if (!G.activeCombatHex || !G.players[playerID].selectedToken) {
    return INVALID_MOVE;
  }

  // Validate that the targeted hex is acceptable
  var targetHex: HexType = FindElementById(G.map, G.activeCombatHex);
  var action = FindTokenInMap(G, G.players[playerID].selectedToken);
  if (!IsHexValidTargetForAction(G, targetHex, action)) {
    return INVALID_MOVE;
  }

  // Store the attacker and source hex for use in combat resolution
  G.attackerID = playerID;
  const sourceHex: HexType | undefined = FindHexagonWithToken(G, G.players[playerID].selectedToken);
  G.attackerSourceHex = sourceHex ? sourceHex.id : null;

  // Find the defender: first unit on the target hex not owned by the attacker
  const defenderID: string | null = targetHex.units.find(u => u.owner !== playerID)?.owner ?? null;

  if (!defenderID) {
    // Uncontested hex: resolve immediately without a bid phase
    G.players[playerID].bid = 0;
    resolveCombat(G);
    events.endPhase();
    return;
  }

  // Both attacker and defender enter the blind bid stage
  events.setActivePlayers({
    value: {
      [playerID]: 'bidSelection',
      [defenderID]: 'bidSelection'
    }
  });
}

/* Staged bid update — stores the pending bid amount in player state */
export let setPendingBid: Move = {
  move: ({ G, playerID }: MovePropsType, amount: number) => {
    const player = G.players[playerID];
    const clamped = typeof amount === 'number' ? Math.min(player.gold, Math.max(0, amount)) : 0;
    player.pendingBid = clamped;
  },
  redact: true,
  noLimit: true
};

/* Blind bid submission — commits pendingBid, redacted so opponents cannot see the amount */
export let submitBid: Move = {
  move: ({ G, ctx, events, playerID }: MovePropsType) => {
    const player = G.players[playerID];
    const amount = player.pendingBid ?? 0;
    if (typeof amount !== 'number' || amount < 0 || amount > player.gold) {
      return INVALID_MOVE;
    }

    player.bid = amount;

    // When every active player has submitted their bid, resolve combat and advance the phase
    const activePlayerIDs = Object.keys(ctx.activePlayers || {});
    const allBid = activePlayerIDs.every(pid => G.players[pid]?.bid !== null);

    if (allBid) {
      resolveCombat(G);
      events.endPhase();
    } else {
      events.endStage();
    }
  },
  redact: true,
  noLimit: true
};
