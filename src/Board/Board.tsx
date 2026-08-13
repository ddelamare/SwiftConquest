import { Component } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import { HexGrid, Layout } from 'react-hexgrid';
import type { GameState, HexState } from '../Domain/Model';
import { Phase, Stage } from '../Domain/Model';
import { validTargetIDs } from '../Domain/Rules';
import Hex from '../Component/Hex/Hex';
import Token from '../Component/Token/Token';
import { GetPlayerStage, IsPlayerActive } from '../Helpers/Players';
import { IsReadyToLockInTarget } from '../Helpers/Actions';
import { GameClientContext } from '../UI/GameClientContext';
import PlayerButton from '../UI/PlayerButton';
import Gradients from './Gradients';
import Patterns from './Patterns';
import './Board.css';

interface BoardState {
  pendingBid: number;
}

class Board extends Component<BoardProps<GameState>, BoardState> {
  state: BoardState = { pendingBid: 0 };

  private handleHexClick = (_event: unknown, hex: HexState, highlightedTargets: Set<string>) => {
    const { ctx, moves } = this.props;
    if (ctx.phase === Phase.InitialUnitPlacement) moves.placeDude(hex.id);
    if (ctx.phase === Phase.ActionPlacement) moves.placeToken(hex.id);
    if (ctx.phase === Phase.AttackResolution && highlightedTargets.has(hex.id)) moves.selectTarget(hex.id);
  };

  render() {
    const { G, ctx, moves, playerID } = this.props;
    if (!IsPlayerActive(ctx, playerID)) return <div />;

    const currentPlayer = playerID ? G.players[playerID] : undefined;
    const highlightedTargets = playerID ? validTargetIDs(G, playerID) : new Set<string>();
    const isInBidStage = GetPlayerStage(ctx, playerID) === Stage.BidSelection;
    const maxBid = currentPlayer?.gold ?? 0;
    const pendingBid = Math.min(this.state.pendingBid, maxBid);
    const contextValue = { G, ctx, moves, playerID };

    return (
      <GameClientContext.Provider value={contextValue}>
        <div className={playerID === '0' ? 'default-theme' : 'dark-theme'}>
          <div className="board">
            <div className="ui-overlay">
              <div className="ui-overlay-bottom-right ui-overlay-clickable">
                {ctx.phase === Phase.ActionPlacement && (
                  <PlayerButton onClick={() => moves.lockInTokens?.()}>Confirm Token Placement</PlayerButton>
                )}
                {ctx.phase === Phase.AttackResolution && IsReadyToLockInTarget(G, ctx, playerID) && (
                  <PlayerButton onClick={() => moves.lockInTarget?.()}>Confirm Target Hex</PlayerButton>
                )}
                {isInBidStage && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '12px' }}>Combat — submit your bid (gold: {maxBid})</span>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input
                        aria-label="Combat bid"
                        type="number"
                        min={0}
                        max={maxBid}
                        step={1}
                        value={pendingBid}
                        onChange={(event) => {
                          const parsed = Number.parseInt(event.target.value, 10);
                          this.setState({ pendingBid: Number.isNaN(parsed) ? 0 : Math.min(maxBid, Math.max(0, parsed)) });
                        }}
                        style={{ width: '60px' }}
                      />
                      <PlayerButton onClick={() => {
                        moves.submitBid(pendingBid);
                        this.setState({ pendingBid: 0 });
                      }}>Submit Bid</PlayerButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <HexGrid width="100vw" height="100vh" viewBox="-50 -50 100 100">
              <Patterns />
              <Gradients />
              <Layout size={{ x: 6, y: 6 }}>
                <g>
                {G.map.map((hex) => (
                  <Hex
                    key={hex.id}
                    onClick={(event) => this.handleHexClick(event, hex, highlightedTargets)}
                    data={hex}
                    isHighlighted={highlightedTargets.has(hex.id)}
                  >1</Hex>
                ))}
                <svg width="35" height="6" x="-49" y="-50" viewBox="0 0 70 10" style={{ fontSize: '3px' }}>
                  <rect width="100%" height="100%" rx="1" fillOpacity="0" strokeOpacity="1" stroke="black" strokeWidth=".5" />
                  {G.actionPool.map((token, index) => (
                    <g transform={`translate(${11 * (index + 0.5)},5)`} key={`${playerID}ap${token.id}`} onClick={() => moves.pickAction(index)}>
                      <Token tid={token.id} type={token.type} owner={null} rank={null} renderSvgTag={false} />
                    </g>
                  ))}
                </svg>
                {Object.entries(G.players).map(([id, player], index) => (
                  <svg key={id} width="35" height="6" x="-49" y={-50 + ((index + 1) * 6)} viewBox="0 0 70 12" style={{ fontSize: '3px' }}>
                    <rect width="100%" height="100%" rx="1" fillOpacity="0" strokeOpacity="1" stroke="black" strokeWidth=".5" />
                    {player.availableActions.map((token, tokenIndex) => (
                      <g transform={`translate(${11 * (tokenIndex + 0.5)},5)`} key={`${playerID}ava${token.id}`} onClick={() => moves.selectToken(token.id)}>
                        <Token tid={token.id} type={token.type} owner={token.owner} rank={null} renderSvgTag={false} />
                      </g>
                    ))}
                    <text x={48} y={4} fontSize="3px" fill="#f4c430"><title>Gold</title>Gold:{player.gold}</text>
                    <text x={48} y={9} fontSize="3px" fill="#00cfcf"><title>Gems (victory points)</title>Gems:{player.gems}</text>
                  </svg>
                ))}
                <text x={-9} y={-45} fontSize="5px">{ctx.phase}</text>
                <text x={-9} y={-40} fontSize="5px">{JSON.stringify(ctx.activePlayers)}</text>
                </g>
              </Layout>
            </HexGrid>
          </div>
        </div>
      </GameClientContext.Provider>
    );
  }
}

export default Board;
