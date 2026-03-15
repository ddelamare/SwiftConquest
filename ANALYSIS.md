# SwiftConquest — Next Steps Analysis

This document analyzes the current state of the game and outlines a design-first path forward. Every suggestion is framed around two constraints:

1. **Fully deterministic** — no dice, no shuffled decks, no randomness of any kind.
2. **Stalemate-resistant** — the game must actively push players toward decisions rather than letting them sit still.

---

## Where Things Stand

The core scaffolding is solid. The action draft, simultaneous token placement, and the attack-resolution phase structure all work. What is missing is the *substance* inside those phases: combat has no outcome, Defend and Gather do nothing, income is unimplemented, and there is no winning condition. The game can be played through its motions but produces no result.

The good news is that the most important design decisions — simultaneous placement, hidden information during placement, and the bid/aid system — are already sketched out. The next steps are mostly about filling in those gaps with rules that produce interesting decisions without ever rolling a die.

---

## The Core Stalemate Problem

Without careful design, a fully deterministic territory control game almost always converges on a standoff. If attacking is never better than defending, players stop attacking. If there is no cost to sitting still, the safest play is always to wait. The sections below describe specific mechanisms that punish passivity and reward forward play, without introducing randomness.

---

## Recommended Next Steps

### 1. Combat Resolution via Unit Strength and Gold Bids

**The problem:** Attack resolution currently has no outcome. The `bidSelection` and `attackResolution` stages exist but do nothing.

**The solution:** Make combat purely arithmetic.

- The **attacker's strength** equals the number of their units on the source hex, plus any Aid contributions from neighboring allies (see Aid below).
- The **defender's strength** equals the number of units on the target hex, multiplied by 2 if a Defend token is also placed on that hex.
- Each side may silently commit any amount of their gold as a **bid**, which adds directly to their strength for this one combat.
- The side with higher total strength wins. **Ties go to the attacker.** This is the most important stalemate-breaking rule in the game — it ensures there is always a winner and that static defense is never the dominant strategy.

**Outcome of a won attack:**
- The attacker moves *all* of their attacking units onto the target hex.
- The loser loses *one* unit (the unit is removed from the board entirely).
- The winner keeps all of their units.

**Why no randomness is needed:** Gold bids serve the same tension-building function as dice do in other games, but they are entirely knowable and strategic. A player choosing how much gold to commit is making a calculated decision with real stakes.

---

### 2. Mine Income and the Gold Economy

**The problem:** Four Mine hexes are marked on the board but produce nothing. Players start with 10 gold that is never used. Without a resource loop, there is nothing to fight over and no long-term consequence to any decision.

**The solution:** Run an income phase after each round of combat.

- At the start of each **Income Phase**, every player receives **+1 gold** per Mine hex that they currently control (i.e., they have at least one unit there and no enemy units).
- A player who controls no mines gains no income. Their gold pool slowly becomes the limiting factor on how aggressively they can bid.
- Players who hold mines compound their advantage, creating pressure on everyone else to contest them.

**Why this prevents stalemate:** A player who turtles on non-mine hexes will eventually run out of gold and be unable to win close combats. The map's four mines are always contested, always valuable, and always pulling players away from passive play.

---

### 3. The Defend Action — Meaningful but Not Dominant

**The problem:** Defend currently does nothing. If it is implemented naively (e.g., doubles strength unconditionally), it makes holding territory trivially easy and re-creates the stalemate problem.

**The solution:** Defend doubles the strength of units on the defended hex *for this round only*, but also **prevents those units from moving or attacking next round**. A hex that defends has committed to staying put. The player must place a Defend token on the hex to gain the bonus.

- Defenders with a Defend token: `(units × 2) + gold bid`
- Defenders without a Defend token: `units + gold bid`

**Why this is balanced:** Defend is strong in a single round but costs a future action. An attacker who sees a Defend token can simply redirect elsewhere, spend a round building strength, and come back. Defend is a delay, not a permanent wall.

---

### 4. The Gather Action — Efficient but Exposed

**The problem:** Gather has no targeting or effect. It needs a concrete output and a concrete tradeoff.

**The solution:** A Gather token placed on a Mine hex (where the player owns units) yields **+2 gold** to that player during the Income Phase instead of the normal +1. Unlike other token types, **Gather tokens are revealed to all players immediately after placement is locked in**, making the hex a tempting attack target.

> *Implementation note:* The current `playerView` hides all tokens as `Action.Unknown` until `attackResolutionPhase`. Gather tokens should be the exception — they should be sent to clients with their true type at the end of `actionPlacementPhase`.

- Normal mine control: +1 gold per round
- Mine control with Gather: +2 gold per round
- No units on the hex: 0 gold

**Why this is interesting:** Using Gather means you are not using Attack or Aid. The player who Gathers is choosing economic growth over military action. Opponents can see this and punish it. The decision of when to Gather and when to fight is a core strategic tension.

---

### 5. The Aid Action — Strength Sharing Over Distance

**The problem:** The Aid token's targeting logic is partially implemented (it locks onto `activeCombatHex`) but the mechanical effect is not applied.

**The solution:**

- A player who has placed an Aid token on a hex adjacent to an ongoing attack may **contribute their unit count from that hex to either side's strength**.
- The Aid decision happens in the `aidSelection` stage that is already scaffolded.
- If a player aids the attacker, their units add to the attacker's strength total.
- If a player aids the defender, their units add to the defender's strength total.
- The aiding player's units do not move and do not take casualties regardless of who wins.

**Why this is interesting:** Aid allows players to act as kingmakers in combats they are not directly involved in. This creates diplomacy-like decisions without any randomness or hidden state — the aid selection is visible to all players at resolution time.

---

### 6. Turn Order Based on Gold — A Built-In Catch-Up Mechanism

**The problem:** Deterministic games with fixed turn order often have a first-player advantage. The player who always acts first can always dictate the pace of the game.

**The solution:** At the start of each round, players draft actions in **ascending gold order** — the poorest player picks first, the richest player picks last. This means:

- The player who is behind economically gets to draft the most powerful token first (typically Attack).
- The player who is ahead economically must take whatever is left.
- The turn order inverts naturally as the game progresses.

This is fully deterministic (gold totals are known) and provides a built-in catch-up mechanism without any randomness.

---

### 7. Victory Condition — Mine Control

**The problem:** There is no `endIf` condition. The game runs forever.

**The solution:** A player wins if, **at the end of any Income Phase**, they control a **majority of the Mine hexes on the map** (currently 3 of 4, but the threshold should always be `floor(mineCount / 2) + 1` so the condition scales if the map changes).

- This is a clear, achievable objective that both players can evaluate at any time.
- It requires active forward play — you cannot win by staying in your starting position.
- It is fully deterministic — mine control is an objective board state.

A secondary condition (as a tiebreaker or alternative): a player also wins if they have **accumulated 30 gold** at any point, representing economic dominance. This rewards the Gather-focused player who successfully defends mines over many rounds.

The `Game.endIf.ts` file currently always returns `false` and is the right place to implement this check.

---

### 8. The Reset Phase — Recycle the Action Pool

**The problem:** The Reset Phase is a placeholder. Without it, the action pool (which starts with one of each token type) would run out after one round.

**The solution:** During the Reset Phase:

- All Action tokens are returned from the map and from player hands back to the shared pool.
- All `isHighlighted` flags on hexes are cleared.
- `activeCombatHex` is set back to `null`.
- The turn order for the next draft is recalculated based on current gold totals (ascending).

This is purely mechanical and requires no player decisions.

---

### 9. Action Resolution Order (Within the Attack Phase)

The `todo.txt` notes that actions should cycle in order by type, then player. The recommended order is:

1. **All Attack tokens**, resolved in player turn order (the current-round draft order).
2. **All Aid tokens** are resolved as part of the attack they are supporting (already handled by `aidSelection`).
3. **All Defend tokens** are applied at the time their hex is attacked (passive effect, no active resolution step needed).
4. **All Gather tokens** are resolved during the Income Phase, not the Attack Phase.

This ordering means attackers always have the initiative. Defenders react to attackers. Aid tokens support a specific attack and are consumed when that attack resolves. This keeps resolution predictable and avoids the circular dependency problem (who acts first when both players have attack tokens targeting each other's hexes).

**For the circular dependency case** (player A attacks player B's hex while player B attacks player A's hex simultaneously): resolve in player draft order. Player A's attack resolves first. If player A wins, their units move to player B's hex. Player B's attack then resolves from their new (reduced) position.

---

### 10. Quality-of-Life Features That Enable All of the Above

Before implementing the mechanics above, the following UI and infrastructure work will make everything else easier to build and test:

- **Collapsible player trays** — the board becomes crowded with more than 2 players; trays need to fold away.
- **Gold display** — players need to see their own gold total and their opponents' at all times. Since gold is fully public information (no hidden state), this should always be visible.
- **Action resolution log** — a small sidebar or history panel showing the last round's combat outcomes. Fully deterministic games live and die by the clarity of their history.
- **Auto-play / bot mode** — the `todo.txt` lists this; it is essential for testing combat balance without needing multiple human players.
- **Lobby and player count selection** — the game currently hardcodes a player count. A lobby screen that lets players choose 2–4 players is the entry point for any public testing.

---

## Summary of Design Principles Applied

| Principle | Mechanism |
|-----------|-----------|
| No randomness | Arithmetic combat, gold bids, fixed turn order |
| Prevent turtling | Ties go to attacker; gold income requires mine control |
| Prevent runaway leader | Turn order favors poorest player in draft |
| Create meaningful choices | Defend costs future action; Gather exposes you; Aid is a diplomacy tool |
| Clear win condition | Control 3 of 4 mines, or accumulate 30 gold |
| Sustainable round loop | Reset Phase restores full action pool each round |
