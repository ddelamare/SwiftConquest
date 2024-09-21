import { Component, createContext } from 'react';
import Token from '../Component/Token/Token'
import Hex from '../Component/Hex/Hex'
import * as PropTypes from 'prop-types'
import type { BoardProps } from 'boardgame.io/react';
import './Board.css'
import { KeysAsArray } from '../Utils/Objects'
import { HexGrid, Layout } from 'react-hexgrid';
import { GridGenerator } from 'react-hexgrid';
import Patterns from './Patterns';

export const MoveContext = createContext<any | null>(null);

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
    var hexClickHandler = (evt, hex) => {
      if (this.props.ctx.phase === "initialUnitPlacement"){
        this.props.moves.placeDude(hex.id);
      }
      if (this.props.ctx.phase === "mainPhase"){
        this.props.moves.placeToken(hex);
      }
    };
    return (
      <MoveContext.Provider value={this.props.moves}>
      <div className={this.props.playerID === "0" ? "default-theme" : "dark-theme"}>
        <div className="board">
          <HexGrid width="100vw" height="100vh" viewBox="-50 -50 100 100">
            <Patterns/>
            <Layout size={{ x: 6, y: 6 }}>
              {this.props.G.map.map((hex) => <Hex key={hex.id} onClick={(e) => hexClickHandler(e,hex)} data={hex}>1</Hex>)}
              <svg width="35" height="6" x="-49" y="-50" viewBox='0 0 70 10' style={{fontSize: "3px"}}>
                <rect width="100%" height="100%"  rx="1" fillOpacity="0" strokeOpacity="1" stroke='black' strokeWidth=".5"></rect>
                {this.props.G.actionPool.map((token, i) => {
                    return (<g transform={`translate(${11 * (i + .5) },5)`} key={this.props.playerID + "ap" + token.id} onClick={() => { this.props.moves.pickAction(i); }}><Token  type={token.type} owner={null} rank={null} renderSvgTag={false}></Token></g>)
                  })}
              </svg>
              {KeysAsArray(this.props.G.players).map((player, pid) => {
              return <svg width="35" height="6" x="-49" y={-50 + ((pid + 1) * 6)} viewBox='0 0 70 10' style={{fontSize: "3px"}}>
                <rect width="100%" height="100%"  rx="1" fillOpacity="0" strokeOpacity="1" stroke='black' strokeWidth=".5"></rect>
                {player.availableActions.map((token, i) => {
                  return (<g transform={`translate(${11 * (i + .5) },5)`} key={this.props.playerID + "ava" + token.id} className={token.id === player.selectedToken ? "glow" : ""} onClick={() => { this.props.moves.selectToken(token.id) }}><Token type={token.type} owner={token.owner} rank={null} renderSvgTag={false}></Token></g>)
                })}
              </svg>
            })}
            <text x={-9} y={-40} fontSize="5px">{this.props.ctx.phase}</text>
            </Layout>
          </HexGrid>
        </div>
        <button onClick={() => this.props.events.endPhase?.()}>End Phase</button>
      </div>
      </MoveContext.Provider>
    );
  }
}


export default Board;