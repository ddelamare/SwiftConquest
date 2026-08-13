# SwiftConquest Architecture

This document records the architectural boundaries for SwiftConquest. The most
important constraint is that boardgame.io owns synchronization and replay of the
game state, so choosing where a value lives also determines which peers receive
it and whether it becomes part of the match history.

## Dependency direction

Dependencies flow in one direction:

```text
React UI -> boardgame.io adapter -> domain
```

- `src/Domain` contains JSON-serializable models, the board definition, selectors,
  and pure rules. It must not import React, boardgame.io, or UI components.
- `src/Game` adapts the domain to boardgame.io moves, phases, hooks, secret views,
  and combat lifecycle.
- `src/Board`, `src/Component`, and `src/UI` render the peer-specific game view and
  dispatch commands. Domain and game modules must never import them.

This rule prevents circular dependencies and allows rules to be tested without a
browser or React renderer.

## State placement and peer synchronization

### Authoritative synchronized state: `G`

boardgame.io synchronizes `G` across the participating clients and the
authoritative multiplayer host/server. Values in `G` must be JSON-serializable.
They are also candidates for persistence, replay, undo, logs, and AI simulation.

Store a value in `G` when it is a committed game fact that affects legality,
resolution, reconnection, replay, or another peer's view. Current examples are:

- token ownership and placement;
- unit ownership and placement;
- the selected committed action token;
- the committed combat target and attacker source hex;
- committed secret bids;
- gold, gems, round number, and deterministic entity counters.

Do not put classes, functions, DOM values, React state, or transient view styling
in `G`.

### Secret synchronized state: `G` plus `playerView`

A secret that affects game resolution still belongs in authoritative `G`; hiding
it only in React is not secure and prevents reliable resolution after reconnect.
`playerView` must return a peer-specific projection that masks secrets before
they reach other players.

Current policy:

- a player can see their own committed bid and available action types;
- opponents receive `bid: null`, `selectedToken: null`, and `Action.Unknown` for
  hidden action types;
- public scores and board facts remain visible.

Whenever a secret field is added to `G`, its `playerView` treatment and tests must
be added in the same change. Spectator behavior (`playerID === null`) must also be
considered explicitly.

### Move arguments and redaction

Move arguments express commands, not trusted state. A move should accept stable
IDs or primitive values, resolve entities from authoritative `G`, validate every
invariant, and mutate only after validation succeeds.

Secret arguments, such as a submitted bid, must use a redacted long-form move so
the value is not exposed in the move log delivered to other peers. Redaction is
not a substitute for `playerView`: the committed secret must also be masked in
the synchronized state projection.

Moves run optimistically on a client and authoritatively on the multiplayer
host/server. Therefore moves must be deterministic, side-effect free apart from
updating `G` or invoking boardgame.io events, and must not read local React state,
the clock, unseeded randomness, the network, or the DOM.

### Authoritative phase hooks

boardgame.io phase hooks such as `onBegin` and `onEnd` run on the authoritative
side in multiplayer. They are appropriate for automatic lifecycle work such as
income and round reset. Keep their logic in named functions so it can be tested
directly instead of embedding large blocks in the phase configuration.

### Client-only presentation state

Keep a value in React-local state, props, or a derived selector when losing it on
refresh does not affect the match and no other peer needs it. Current examples:

- the unsubmitted value in the bid input;
- highlighted legal target hexes;
- hover, focus, animation, open panels, and layout preferences.

Target highlights are derived from the peer's visible `G`, player ID, and current
selection. They are deliberately not written to hexes in `G`, because highlights
are player-specific and simultaneous players may have different valid targets.

## Determinism and identifiers

Never use `Date.now()` or `Math.random()` in setup, moves, or lifecycle hooks.
The same command must produce the same state when replayed by different peers.

- Board hex IDs derive from their cube coordinates.
- Draft-token IDs derive from round and action type.
- Starting action IDs derive from player and action type.
- Unit IDs use a synchronized monotonic counter in `G`.

If gameplay randomness is introduced later, use boardgame.io's random plugin so
the seed and results participate in deterministic state handling.

## Move validation contract

Every move follows this order:

1. Resolve the acting player and referenced entities from `G`.
2. Validate payload shape and range, including integer requirements.
3. Validate phase/stage availability through boardgame.io configuration.
4. Validate ownership and game-rule predicates.
5. Return `INVALID_MOVE` before any mutation when validation fails.
6. Apply the complete state transition atomically.

Never accept a client-supplied hex, token, player, or unit object as authoritative.
Accept its ID and look it up in `G`.

## Phase and rule organization

`src/Game/Game.ts` is declarative wiring. Rule implementation belongs elsewhere:

- setup and peer projections: `Game.setup.ts`;
- player moves: `Game/Moves`;
- combat resolution: `Game/Combat.ts`;
- automatic phase lifecycle: `Game.lifecycle.ts`;
- pure legality and queries: `Domain/Rules.ts` and `Domain/Selectors.ts`.

Phase and stage names are centralized in `Domain/Model.ts`. Avoid repeating raw
phase strings throughout the codebase.

## Testing expectations

Changes to rules or synchronized state should include tests for:

- valid and invalid moves, including proof that invalid moves do not mutate `G`;
- ownership and peer isolation;
- `playerView` secret masking for the owner, opponent, and spectator;
- deterministic setup and IDs;
- phase lifecycle transitions, income, reset, combat, and victory ties;
- derived UI state where it affects available commands.

Prefer pure domain and game-function tests. A render smoke test is useful but is
not a substitute for rule-level coverage.

## Lessons learned

- A type defined in a React component is still a dependency on the UI layer; all
  shared game types belong in the domain.
- Hiding a secret visually does not hide it from peers. Secret authoritative state
  requires `playerView`, and secret move payloads require log redaction.
- Conversely, storing every UI interaction in `G` creates network traffic, replay
  noise, and cross-player interference. Only committed facts belong there.
- Passing whole client objects to moves expands the trust boundary. Stable IDs and
  server-side resolution are safer and easier to evolve.
- Deterministic gameplay includes identifiers and setup data, not only combat math.
- Large feature PRs that add phases and rules without tests amplify existing
  coupling. Establish domain boundaries before expanding the state machine.
- Dependency updates and architectural refactors should usually remain separate;
  otherwise type/toolchain failures are difficult to attribute.

