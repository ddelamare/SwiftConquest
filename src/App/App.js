import { Client } from 'boardgame.io/react';
import Game from '../Game';
import Board  from '../Board';
const App = Client({
  game: Game({moves: 2}),
  board: Board,
});
export default App;