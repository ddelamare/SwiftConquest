# SwiftConquest

Contributor architecture and peer-state rules are documented in
[ARCHITECTURE.md](./ARCHITECTURE.md). Read it before adding game state, moves,
secret information, phases, or UI interaction state.

SwiftConquest is a digital, turn-based, hexagonal territory control board game built with React and [boardgame.io](https://boardgame.io/). Multiple players compete to expand their presence across a shared hex map by drafting action tokens, deploying units, and resolving combat.

> **Note:** This game is currently in active development. Core scoring, victory,
> income, and combat loops are implemented, while several action mechanics and
> multiplayer-facing quality-of-life features remain incomplete.

---

## Gameplay Overview

### The Board

The game is played on a grid of **37 hexagonal tiles** arranged in a circular pattern. Four of these tiles are **Mine hexes** — special resource locations scattered across the map. Players are identified by a unique color used for both their units and their action tokens.

---

### How a Round Works

Each round of SwiftConquest moves through several phases:

#### 1. Action Draft

At the start of each round, a shared pool of **four action tokens** is placed in the center:

| Action | Description |
|--------|-------------|
| ⚔️ **Attack** | Assault an adjacent hex occupied by an enemy |
| 🛡️ **Defend** | Protect your units on a hex |
| ⛏️ **Gather** | Collect resources from the hex you occupy |
| 🩹 **Aid** | Support an ally in a nearby combat |

Players take turns **picking one token** from the pool. Tokens go directly into the player's hand for use later in the round. Once the pool is empty, the draft ends.

---

#### 2. Initial Unit Placement *(first round only)*

Before the main action loop begins, players take turns **placing their units** (called *dudes*) onto empty hexes one at a time. This continues until **12 units in total** have been placed across the entire board. This phase only happens once, at the very start of the game.

---

#### 3. Action Placement *(simultaneous)*

All players act **at the same time** during this phase:

1. A player **selects an action token** from their hand — valid hexes on the board are highlighted.
2. The player **places the token** on one of those highlighted hexes (they must own at least one unit on that hex).
3. Only one action token may be placed per hex.
4. Players may **remove and reposition** a token they've already placed before confirming.
5. Once satisfied, a player clicks **Confirm** to lock in their placements.

While placements are being made, **other players' tokens appear as "?"** — their chosen actions are hidden until all players have locked in.

---

#### 4. Attack Resolution

Once everyone has confirmed, actions are resolved one at a time. During this phase:

- The active player **selects one of their placed action tokens** and then chooses a **target hex**.
- Nearby players who hold an **Aid token** may have the option to support the combat.
- Players proceed through the resolution stages: *Action Selection → Aid Selection → Bid Selection → Attack Resolution*.

> ⚠️ **Work in progress:** Full combat resolution, the bid system, and the effects of Defend and Gather actions are not yet implemented. The game currently steps through the attack resolution structure but does not apply results.

---

#### 5. Income Phase *(not yet implemented)*

After combat, players will eventually collect income based on territories or mines they control. This phase is a placeholder.

---

#### 6. Reset Phase *(not yet implemented)*

The board will reset in preparation for the next round. This phase is a placeholder.

---

### Winning the Game

> ⚠️ **Not yet implemented.** Scoring and victory conditions have not been added to the game. The game currently runs indefinitely through its phases without a defined end state.

---

### Player Interface

- **Action Pool** (top-left): Shows the tokens still available to draft.
- **Player Trays** (left side): Each player's held tokens. Your own tokens show their type; opponents' tokens appear as **?** until revealed.
- **Hex Grid** (center): The main board. Click a token, then click a highlighted hex to place it.
- **Confirm Button** (bottom-right): Locks in your placements for the current phase.

---

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
