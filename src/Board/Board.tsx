import { Component, ReactElement } from 'react';
import Token from '../Component/Token/Token'
import * as PropTypes from 'prop-types'
import type { BoardProps } from 'boardgame.io/react';
import './Board.css'
class Board extends Component<BoardProps> {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
    isMultiplayer: PropTypes.bool,
    isConnected: PropTypes.bool,
    isPreview: PropTypes.bool,
  };

  onClick = (id) => this.props.moves.clickCell(id);
  pickAction = (id) => this.props.moves.pickAction(id);


  render() {
    let winner : ReactElement = <div></div>;
  if (this.props.ctx.gameover) {
    winner =
      this.props.ctx.gameover.winner !== undefined ? (
        <div id="winner">Winner: {this.props.ctx.gameover.winner}</div>
      ) : (
        <div id="winner">Draw!</div>
      );
  }

  const cellStyle : any  = {
    border: '1px solid #555',
    width: '50px',
    height: '50px',
    lineHeight: '50px',
    textAlign: 'center',
  };

  let cells : Array<ReactElement> = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const id = 3 * i + j;
      cells.push(
        <div key={id}>this.props.G.cells[id]</div>
      );
    }
  }

  return (
    <div>
      <div className="board">
        {this.props.G.map.map((row, i) => {
          return (<div  className='hex-container'>{row.map((tile, j) => {
            return (<div key={tile}>{tile}</div>)
          })} </div>)})}
      </div>
      <table id="actionPool">
        <tbody>
        <tr>
          {this.props.G.actionPool.map((token, i) => {
            return (<td key={token} onClick={() => this.pickAction(i)}><Token type={token} owner={null} location={null}></Token></td>)
          })}
          <td></td>
        </tr>
          </tbody>
      </table>
      <table id="actionPool">
      <tbody>
        <tr>
          {this.props.plugins.player.data.players[this.props.ctx.currentPlayer].availableActions.map((token, i) => {
            return (<td key={i} ><Token type={this.props.plugins.player.data.players[this.props.ctx.currentPlayer].availableActions[i]} owner={this.props.ctx.currentPlayer} location={null}></Token></td>)
          })}
        </tr>
        <tr>
          {this.props.plugins.player.data.players[this.props.playerID!].availableActions.map((token, i) => {
            return (<td key={i} ><Token type={this.props.plugins.player.data.players[this.props.playerID!].availableActions[i]} owner={this.props.playerID} location={null}></Token></td>)
          })}
        </tr>
        </tbody>

      </table>
      <button onClick={() => this.props.events.endPhase?.()}>End Phase</button>
      {winner}
    </div>
  );
  }
}


export default Board;