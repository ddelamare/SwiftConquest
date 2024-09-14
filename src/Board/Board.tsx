import { Component } from 'react';
import Token from '../Component/Token/Token'
import Hex from '../Component/Hex/Hex'
import * as PropTypes from 'prop-types'
import type { BoardProps } from 'boardgame.io/react';
import './Board.css'
import { KeysAsArray } from '../Utils/Objects'
import { HexGrid, Layout } from 'react-hexgrid';
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

  static HexMap = GridGenerator.hexagon(3);

  render() {
    return (
      <div className={this.props.playerID === "0" ? "default-theme" : "dark-theme"}>
        <div className="board">
          <HexGrid width="100vw" height="100vh" viewBox="-50 -50 100 100">
            <Layout size={{ x: 6, y: 6 }}>
              {this.props.G.map.map((hex) => <Hex key={hex.id} onClick={() => this.props.moves.placeToken(hex)} data={hex}>1</Hex>)}
              <svg width="70" height="10" x="-48" y="-50" viewBox='0 0 70 10' style={{fontSize: "3px"}}>
                <rect width="100%" height="100%"  rx="1" fillOpacity="0" strokeOpacity="1" stroke='black' strokeWidth="1"></rect>
                {this.props.G.actionPool.map((token, i) => {
                    return (<g transform={`translate(${10 * (i + .5) },5)`} key={this.props.playerID + "ap" + token.id} onClick={() => { this.props.moves.pickAction(i); }}><Token  type={token.type} owner={null} rank={null} renderSvgTag={false}></Token></g>)
                  })}
              </svg>
            </Layout>
          </HexGrid>
        </div>
        <table>
          <tbody>
            <tr>

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
      </div>
    );
  }
}


export default Board;