import { Component, ReactElement } from 'react';
import Token from '../Component/Token/Token'
import * as PropTypes from 'prop-types'
import type { BoardProps } from 'boardgame.io/react';
import './Board.css'
import { KeysAsArray } from '../Utils/Objects'
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

  console.log(this.props.plugins.player.data.players)
  return (
    <div>
      <div className="board">
        {this.props.G.map.map((row, i) => {
          return (<div key={i + "i"}  className='hex-container'>{row.map((tile, j) => {
            return (<div key={i + " " + j} onClick={() => this.props.moves.placeToken(tile)}>{tile}</div>)
          })} </div>)})}
      </div>
      <table>
        <tbody>
        <tr>
          {this.props.G.actionPool.map((token, i) => {
            return (<td key={this.props.playerID + "ap" + token.id} onClick={() => {this.props.moves.pickAction(i);}}><Token type={token.type} owner={null} rank={null}></Token></td>)
          })}
          <td></td>
        </tr>
          </tbody>
      </table>
      <table>
      <tbody>
        {KeysAsArray(this.props.plugins.player.data.players).map((player, pid) => {
          return <tr key={"avatr" + pid}>
            {player.availableActions.map((token, i) => {
            return (<td key={this.props.playerID + "ava" + token.id} className={token.id === player.selectedToken? "glow" : "shadow"} onClick={() => {this.props.moves.selectToken(token.id)}}><Token type={token.type} owner={token.owner} rank={null}></Token></td>)
          })}
          </tr>
        })}
        
        </tbody>

      </table>
      <button onClick={() => this.props.events.endPhase?.()}>End Phase</button>
      {winner}
    </div>
  );
  }
}


export default Board;