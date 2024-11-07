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
import PlayerButton from '../UI/PlayerButton';
import { IsPlayerActive } from '../Helpers/Players';
import Gradients from './Gradients';
import { Ctx } from 'boardgame.io';
import { GameStateType } from '../Game/Game.setup';
import { IsReadyToLockInTarget } from '../Helpers/Actions';

export const MoveContext = createContext<any | null>(null);
export const GameCtx = createContext<Ctx | null>(null);
export const GameState = createContext<GameStateType | null>(null);
export const PlayerID = createContext<string | null>(null);

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
      if (this.props.ctx.phase === "initialUnitPlacement") {
        this.props.moves.placeDude(hex.id);
      }
      if (this.props.ctx.phase === "actionPlacementPhase") {
        this.props.moves.placeToken(hex);
      }
      if (this.props.ctx.phase === "attackResolutionPhase") {
        // HACK !! TODO: Find a better way to check this
        if (hex.isHighlighted) {
          this.props.moves.selectTarget(hex);
        }
      }
    };

    if (!IsPlayerActive(this.props.ctx, this.props.playerID)){
      return <div></div>
    }

    return (
      <MoveContext.Provider value={this.props.moves}>
        <GameCtx.Provider value={this.props.ctx}>
          <GameState.Provider value={this.props.G}>
            <PlayerID.Provider value={this.props.playerID}>
            <div className={this.props.playerID === "0" ? "default-theme" : "dark-theme"}>
              <div className="board">
                <div className="ui-overlay">
                  <div className="ui-overlay-bottom-right ui-overlay-clickable">
                    {this.props.ctx.phase === "actionPlacementPhase" && IsPlayerActive(this.props.ctx, this.props.playerID) && <PlayerButton onClick={() => this.props.moves.lockInTokens?.()}>Confirm Token Placement</PlayerButton>}
                    {this.props.ctx.phase === "attackResolutionPhase" && IsReadyToLockInTarget(this.props.G, this.props.ctx, this.props.playerID) && <PlayerButton onClick={() => this.props.moves.lockInTarget?.()}>Confirm Target Hex</PlayerButton>}
                  </div>
                </div>
                <HexGrid width="100vw" height="100vh" viewBox="-50 -50 100 100">
                  <Patterns />
                  <Gradients />
                  <Layout size={{ x: 6, y: 6 }}>
                    {this.props.G.map.map((hex) => <Hex key={hex.id} onClick={(e) => hexClickHandler(e, hex)} data={hex}>1</Hex>)}
                    <svg width="35" height="6" x="-49" y="-50" viewBox='0 0 70 10' style={{ fontSize: "3px" }}>
                      <rect width="100%" height="100%" rx="1" fillOpacity="0" strokeOpacity="1" stroke='black' strokeWidth=".5"></rect>
                      {this.props.G.actionPool.map((token, i) => {
                        return (<g transform={`translate(${11 * (i + .5)},5)`} key={this.props.playerID + "ap" + token.id} onClick={() => { this.props.moves.pickAction(i); }}><Token tid={token.id} type={token.type} owner={null} rank={null} renderSvgTag={false}></Token></g>)
                      })}
                    </svg>
                    {KeysAsArray(this.props.G.players).map((player, pid) => {
                      return <svg key={pid} width="35" height="6" x="-49" y={-50 + ((pid + 1) * 6)} viewBox='0 0 70 10' style={{ fontSize: "3px" }}>
                        <rect width="100%" height="100%" rx="1" fillOpacity="0" strokeOpacity="1" stroke='black' strokeWidth=".5"></rect>
                        {player.availableActions.map((token, i) => {
                          return (<g transform={`translate(${11 * (i + .5)},5)`} key={this.props.playerID + "ava" + token.id} onClick={() => { this.props.moves.selectToken(token.id) }}><Token tid={token.id} type={token.type} owner={token.owner} rank={null} renderSvgTag={false}></Token></g>)
                        })}
                      </svg>
                    })}
                    <text x={-9} y={-45} fontSize="5px">{this.props.ctx.phase}</text>
                    <text x={-9} y={-40} fontSize="5px">{JSON.stringify(this.props.ctx.activePlayers)}</text>
                  </Layout>
                </HexGrid>
              </div>
              <button onClick={() => this.props.events.endPhase?.()}>End Phase</button>
            </div>
            </PlayerID.Provider>
          </GameState.Provider>
        </GameCtx.Provider>
      </MoveContext.Provider>
    );
  }
}


export default Board;