import { Component, ReactElement } from 'react';
import Token from '../Component/Token/Token'
import Hex from '../Component/Hex/Hex'
import * as PropTypes from 'prop-types'
import type { BoardProps } from 'boardgame.io/react';
import './Board.css'
import { KeysAsArray } from '../Utils/Objects'
import { HexGrid, Layout } from 'react-hexgrid';
import { createContext, useContext } from 'react';
import { GridGenerator } from 'react-hexgrid';

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

  static HexMapContext = createContext(Hex[0]);
  static HexMap = GridGenerator.hexagon(4);

  render() {
    let winner: ReactElement = <div></div>;
    if (this.props.ctx.gameover) {
      winner =
        this.props.ctx.gameover.winner !== undefined ? (
          <div id="winner">Winner: {this.props.ctx.gameover.winner}</div>
        ) : (
          <div id="winner">Draw!</div>
        );
    }

    return (
      <Board.HexMapContext.Provider value={Board.HexMap}>
        <div className="board">
          <HexGrid width={900} height={800} viewBox="-50 -50 100 100">
            <Layout size={{ x: 6, y: 6 }}>
              {this.props.G.map.map((hex) => <Hex key={hex.id} onClick={() => this.props.moves.placeToken(hex)} data={hex}>1</Hex>)}
            </Layout>
          </HexGrid>
        </div>
        <table>
          <tbody>
            <tr>
              {this.props.G.actionPool.map((token, i) => {
                return (<td key={this.props.playerID + "ap" + token.id} onClick={() => { this.props.moves.pickAction(i); }}><Token type={token.type} owner={null} rank={null} renderSvgTag={true}></Token></td>)
              })}
              <td></td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            {KeysAsArray(this.props.G.players).map((player, pid) => {
              return <tr key={"avatr" + pid}>
                {player.availableActions.map((token, i) => {
                  return (<td key={this.props.playerID + "ava" + token.id} className={token.id === player.selectedToken ? "glow" : "shadow"} onClick={() => { this.props.moves.selectToken(token.id) }}><Token type={token.type} owner={token.owner} rank={null} renderSvgTag={true}></Token></td>)
                })}
              </tr>
            })}

          </tbody>

        </table>
        <button onClick={() => this.props.events.endPhase?.()}>End Phase</button>
        {winner}
      </Board.HexMapContext.Provider>
    );
  }
}


export default Board;