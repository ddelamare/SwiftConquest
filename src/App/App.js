import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { Game } from '../Game';
import Board  from '../Board';
import { createContext } from 'react';
const GameClient = Client({
  game: Game({}),
  board: Board,
  multiplayer: Local(),
});

const ThemeContext = createContext(null);

const App = () => (
  <ThemeContext.Provider value="default">
    <GameClient playerID="0" />
    <GameClient playerID="1" />
  </ThemeContext.Provider>
);

export default App;