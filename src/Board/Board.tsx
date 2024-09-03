import { Component, ReactElement } from 'react';
import Token from '../Component/Token/Token'
import * as PropTypes from 'prop-types'
import type { BoardProps } from 'boardgame.io/react';
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

  isActive(id) {
    return this.props.isActive && this.props.G.cells[id] === null;
  }

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

  let tbody : Array<ReactElement> = [];
  for (let i = 0; i < 3; i++) {
    let cells : Array<ReactElement> = [];
    for (let j = 0; j < 3; j++) {
      const id = 3 * i + j;
      cells.push(
        <td key={id}>
          {this.props.G.cells[id] ? (
            <div style={cellStyle}>{this.props.G.cells[id]}</div>
          ) : (
            <button style={cellStyle} onClick={() => this.onClick(id)} />
          )}
        </td>
      );
    }
    tbody.push(<tr key={i}>{cells}</tr>);
  }

  return (
    <div>
      <table id="board">
        <tbody>{tbody}</tbody>
      </table>
      <table id="actionPool">
        <tbody>
        <tr>
          {this.props.G.actionPool.map((token, i) => {
            return (<td key={i}>{this.props.G.actionPool[i]}</td>)
          })}
          <td></td>
        </tr>
          </tbody>
      </table>
      <table id="actionPool">
      <tbody>

        <tr>
          {this.props.plugins.player.data.players[this.props.ctx.currentPlayer].availableActions.map((token, i) => {
            return (<td key={i} onClick={() => this.pickAction(i)}><Token type={this.props.plugins.player.data.players[this.props.ctx.currentPlayer].availableActions[i]} owner={null} location={null}></Token></td>)
          })}
          <td></td>
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