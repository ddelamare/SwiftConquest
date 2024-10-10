import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { Game } from '../Game';
import Board  from '../Board';
import { createContext } from 'react';
const numPlayers = 2;
const GameClient = Client({
  game: Game(),
  board: Board,
  multiplayer: Local(),
  numPlayers
});

const ThemeContext = createContext(null);
console.table(GameClient)

const App = () => (
  <ThemeContext.Provider value="default">
    {[...Array(numPlayers)].map((e, i) => <GameClient key={i} playerID={i.toString()} />)}
  </ThemeContext.Provider>
);

export default App;