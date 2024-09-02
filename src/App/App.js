import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { Game } from '../Game';
import Board  from '../Board';
const GameClient = Client({
  game: Game({moves: 2}),
  board: Board,
  multiplayer: Local(),
});

const App = () => (
  <div>
    <GameClient playerID="0" />
    <GameClient playerID="1" />
  </div>
);

export default App;