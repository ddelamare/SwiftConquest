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

### 7. Victory Condition — In-Depth Analysis

**The problem:** There is no `endIf` condition. The game runs forever.

The `Game.endIf.ts` file currently always returns `false` and is the right place to implement whichever condition is chosen. Four candidates are evaluated below, followed by two alternatives.

---

#### Candidate A — Gems as Victory Points (Mines → Gems → Win at X Gems)

Mines no longer produce gold directly. Instead, each Mine hex controlled at the end of an Income Phase yields **1 Gem** to its controlling player. The first player to accumulate a target number of Gems (e.g., 10) wins.

**Strengths:**
- Gems are a dedicated progress meter that is always visible to every player — everyone can see exactly how close each opponent is to winning. This creates escalating pressure over every round of the game.
- Because Gems are the *only* win condition, every strategic decision eventually traces back to mine control. There is no split between military and economic win paths to reason about.
- The target Gem count is a single tuning knob. If games end too quickly, raise it. If they drag, lower it. This is the easiest condition to balance through playtesting.
- Gems cannot be spent or lost, so there is no runaway-leader effect from compound spending. A player who falls behind on mines falls behind at the same rate, making catch-up always possible.

**Weaknesses:**
- Mines need a second resource type (Gems) in addition to the gold used for combat bids. The `GameStateType` and `playerView` would need a `gems` field per player, and the Income Phase implementation must credit Gems separately from gold.
- Because Gems cannot be spent, a player with a large Gem lead has very little incentive to risk their units in unnecessary combats in the late game. They can slow-play and coast to the win. This requires the target count to be set low enough that the game never reaches a comfortable cruising phase.
- Does not address stalemate on its own — players still need a reason to fight over non-mine hexes. Pair with the gold-bid combat system (*Combat Resolution via Unit Strength and Gold Bids*) to keep non-mine territory relevant as staging ground for mine attacks.

**Verdict:** ✅ **Recommended candidate.** It is the clearest, most legible win condition in the set. Every player always knows the score. The implementation is straightforward: add a `gems: number` field per player, credit it in the Income Phase for each controlled mine, and check it in `endIf`. The gold-bid combat system (*Combat Resolution via Unit Strength and Gold Bids*) remains intact as the combat economy, distinct from the Gem victory track.

---

#### Candidate B — Fixed Rounds, Most Gold Wins

The game lasts a fixed number of rounds (e.g., 15). When the final Reset Phase completes, the player with the most gold wins. Mines produce gold each Income Phase as described in Section 2.

**Strengths:**
- Guarantees the game ends. There is no scenario where the game runs indefinitely. This is valuable for any multiplayer format where players need to know roughly how long a session will take.
- The "fixed duration" format is familiar and easy to explain: "we play 15 rounds, then count gold."
- Encourages a different kind of strategic depth in the mid-to-late game: a player who is already winning on gold can afford to play conservatively, while a trailing player *must* take risks to close the gap before time runs out.

**Weaknesses:**
- Gold is already the resource used for combat bids (*Combat Resolution via Unit Strength and Gold Bids*). Winning by hoarding the most gold creates a **direct conflict** between using gold to win combats and saving gold to win the game. A player who bids heavily and wins every fight may lose the gold race to a player who never fought at all. This undermines the mine-control theme — the safest path to victory is to hoard, not to fight.
- Determining the right round count requires extensive playtesting. Too few rounds and the game never develops; too many and it drags. Round count is also map- and player-count-dependent, making this hard to tune.
- "Most gold at game end" is a static snapshot victory. Players can spend the last two rounds doing nothing, knowing that their accumulated gold is already enough to win. This is the definition of the stalemate the game design is trying to avoid.
- If gold is the win condition, the Gather action (doubled mine income) becomes overwhelmingly powerful compared to Attack. The optimal strategy collapses to: control one mine, Gather every round, never fight. This eliminates most of the game's interesting decisions.

**Verdict:** ❌ **Not recommended** without a major restructuring. The dual use of gold as both the combat bid resource and the victory metric creates an irreconcilable tension. If this candidate is chosen, gold bids must be removed from combat resolution and replaced with a different tie-breaking system — which changes the game significantly.

---

#### Candidate C — Total Domination (Wipe All Players Off the Map)

A player wins by eliminating every unit belonging to every opponent. A player is eliminated when they have no units remaining on the board.

**Strengths:**
- The most instinctively understandable win condition. Every player knows exactly what they need to do: destroy everything.
- Encourages constant aggressive forward play — there is never a reason to stop attacking.
- Fully deterministic and easy to check in `endIf`: iterate `G.map`, count units per player, return winner if only one player has units remaining.

**Weaknesses:**
- Total domination victory conditions are notorious for producing **snowball effects**. A player who wins a few early combats has more units, which makes it easier to win the next combat, which gives more units, and so on. The losing player has no meaningful catch-up mechanism and may spend the majority of the game in a losing position they cannot escape. This is especially punishing in a 2-player game.
- The gold-bid combat system (*Combat Resolution via Unit Strength and Gold Bids*) partially mitigates snowballing (the richer player can be outbid), but once units are gone, there is nothing left to bid *with*. A player who loses their last mine cannot bid aggressively, which makes it even harder to survive.
- In a 3+ player game, total domination incentivizes *kingmaking* — two players gang up on the third, eliminate them, and then fight each other. The first player eliminated has no influence over who wins the game. This is generally considered a negative player experience.
- Game length is unpredictable. Two evenly matched players could play indefinitely if neither can achieve a decisive advantage. This reintroduces the stalemate problem.

**Verdict:** ⚠️ **Viable for 2-player only, with reservations.** The snowball risk is real but manageable in a 2-player format. For 3+ players, the kingmaking problem and elimination experience are significant design liabilities. If the target player count is strictly 2, total domination is a clean and legible condition. For any broader scope, pair it with a respawn or reinforcement mechanic to keep eliminated players engaged.

---

#### Candidate D — Game Ends When All Tokens Have Been Drafted

The shared action pool starts with a finite number of tokens. Once all tokens have been drafted and none remain in the pool, the game ends. The player controlling the most hexes (or mines specifically) at that moment wins.

**Strengths:**
- Game length is deterministic and bounded. With a known pool size and player count, the maximum number of draft rounds is calculable in advance.
- Encourages early aggressive play — the token pool is a countdown clock. Players who spend early rounds positioning conservatively may run out of time to execute their strategy.

**Weaknesses:**
- The current implementation has only **4 tokens in the shared pool** (one Attack, one Defend, one Gather, one Aid), and they are returned to the pool each Reset Phase. This means the pool never actually depletes — the Reset Phase refills it. To make this condition work, tokens would need to be *consumed* rather than recycled, which fundamentally changes the action economy.
- Each player also starts with 3 personal action tokens that are separate from the shared pool (`availableActions` in `playerSetup`). It is ambiguous whether those personal tokens count toward "all tokens drafted" or only the shared pool tokens. This ambiguity would need to be resolved in the rules.
- "Most hexes controlled when pool empties" introduces a board-state counting mechanic that is harder to track than a simple numeric threshold. If the end condition is "most mines" rather than "most hexes," it is cleaner but then approaches Candidate A territory.
- The current 4-token pool drafts entirely in one round. The "all tokens drafted" condition would either end the game in one round or require a significant pool expansion (10–20+ distinct tokens with varied effects) to produce a meaningful game arc. That is a substantial scope increase.

**Verdict:** ❌ **Not recommended in the current architecture** without substantial rework to the token economy. The pool recycling in the Reset Phase must be replaced with token consumption, the personal starting tokens must be explicitly handled, and the pool must be large enough to span multiple meaningful rounds. This is worth considering if the game design ever moves toward a deck-building or card-draft model, but it does not fit the current loop.

---

#### Alternative 1 — Territorial Majority (Control More Than Half the Map)

A player wins if, at the end of any Income Phase, they have units on **more than half of all hex tiles** on the board (currently more than 18 of 37). This is a pure territorial condition with no resource tracking.

**Strengths:**
- Immediately intuitive. The board is the score.
- Scales naturally with map size — the threshold is always a majority of tiles, computed dynamically.
- Encourages a broad offensive strategy rather than a mine-camping strategy.

**Weaknesses:**
- With 37 hexes and early-game units capped at 12 (one per hex in `initialUnitPlacement`), controlling 19+ hexes requires substantial reinforcement mechanics that do not currently exist. Income would need to produce new units, not just gold.
- A player who spreads across 19 hexes will have very thin coverage on each hex (likely 1 unit each), making them extremely vulnerable to attack. The win condition and the defensive realities may be incompatible unless unit stacking is introduced.

**Verdict:** Worth considering as a late-game option once unit production via income is implemented.

---

#### Alternative 2 — Hybrid Track (Gems + Gold Threshold)

Mines produce Gems (Candidate A). Additionally, a player can trigger an instant win by accumulating **30 gold** at any point — representing total economic dominance even without mine control. Both conditions are checked at the end of each Income Phase.

**Strengths:**
- Creates two legitimate strategic paths: the military path (fight for mines, collect Gems) and the economic path (Gather heavily, accumulate gold).
- The gold-win threshold is a natural pressure valve. A player who is behind on Gems but ahead on gold has a credible alternate path to victory, keeping them engaged rather than conceding.
- Adding a gold-win condition makes the Gather action genuinely threatening. Opponents must respect a player who is Gathering because ignoring them can hand them a gold win.

**Weaknesses:**
- Two win conditions complicate the cognitive overhead. Players must track two separate tallies and reason about two possible game-ending states simultaneously.
- Requires careful threshold tuning so that neither path is strictly dominant. If 30 gold is achievable before 10 Gems, the game always ends on the gold track. If 30 gold is effectively unreachable, the condition is meaningless.

**Verdict:** ✅ **Recommended if Candidate A is chosen as the base.** Add the gold threshold as a secondary condition to give the Gather action strategic teeth. Start with 30 gold as the threshold and adjust based on playtesting.

---

#### Summary Table

| Candidate | Core Mechanic | Stalemate Risk | Snowball Risk | Implementation Complexity | Verdict |
|-----------|---------------|---------------|---------------|--------------------------|---------|
| A — Gems (VP track) | Mine → Gem each round; first to X wins | Low — Gems create constant time pressure | Low — Gems can't be lost or spent | Low — add `gems` field, credit in Income Phase | ✅ Recommended |
| B — Fixed rounds, most gold | Gold counted at round N | High — hoard and wait is dominant | Low | Medium — round counter, final tally | ❌ Conflicts with bid economy |
| C — Total domination | Wipe all opponents | Medium — stalemates at parity | High — early winner snowballs | Low — check for surviving units | ⚠️ 2-player only |
| D — Token pool depleted | Pool exhausts; count hexes | Low | Medium | High — requires pool rework | ❌ Needs major rework |
| Alt 1 — Territorial majority | Control >50% of hexes | Medium | Medium | Medium — needs unit production | 🔲 Future option |
| Alt 2 — Gems + Gold threshold | Candidate A + 30-gold instant win | Low | Low | Low — extends Candidate A | ✅ Best combined option |

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
| Clear win condition | Gems (Candidate A) + gold threshold (Alt 2); `endIf` checks both |
| Sustainable round loop | Reset Phase restores full action pool each round |
