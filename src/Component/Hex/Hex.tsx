import * as React from 'react';
import Token, { TokenType } from '../Token';
import { Hexagon, Text } from 'react-hexgrid';
import { HexagonProps } from 'react-hexgrid/lib/Hexagon/Hexagon';
import { Hexes } from '../../Helpers/Hexes';
import Unit, { UnitType } from '../Unit/Unit'
import { MoveContext, GameCtx, GameState } from '../../Board'
import { Ctx } from 'boardgame.io';
import { FindTokenInMap } from '../../Helpers/Tokens';
import { GameStateType } from '../../Game/Game.setup';
import { IsPlayerActive } from '../../Helpers/Players';
type HexProps = {
  children: string | JSX.Element | JSX.Element[] | null,
  onClick: React.MouseEventHandler<SVGAElement>;
  data: HexType
}

export type HexType = {
  id: string,
  tokens: TokenType[],
  units: UnitType[],
  type: Hexes,
  tile: HexagonProps,
  isHighlighted?: boolean
}

const Hex = (props: HexProps) => {

  var moves = React.useContext<any>(MoveContext);
  var gameCtx = React.useContext<Ctx | null>(GameCtx);
  var gameState = React.useContext<GameStateType | null>(GameState);
  var tokenClick = (e, id, hexId) => {
    if (gameCtx!.phase === "actionPlacementPhase") {
      moves.clearToken(id, hexId)
    }
    if (gameState && gameCtx!.phase === "attackResolutionPhase") {
      var token = FindTokenInMap(gameState, id);
      if (token && IsPlayerActive(gameCtx!,token.owner)) {
        moves.selectToken(id, hexId);
      }
      // Pass through to hex click
      else {
        props.onClick(e);
      }
    }
  };
  // this calculates the color based on https://www.redblobgames.com/x/1902-hexagon-coloring/
  var sumCoord = Math.abs(((props.data.tile.q - props.data.tile.r) + 9) % 3);
  return <Hexagon className={"hex " + (sumCoord === 0 ? "hex-std " : sumCoord === 1 ? "hex-alt " : "hex-alt-2 ") + (props.data.isHighlighted ? 'hex-highlight ' : '')} key={props.data.id} onClick={props.onClick} q={props.data.tile.q} r={props.data.tile.r} s={props.data.tile.s}>
    {props.data.type === Hexes.Mine ? <circle fill='#mineHex' r="5"></circle> : ''}
    {props.data.tokens.map((token, id) => { return <g key={id} style={{ transform: "scale(75%)" }} onClick={(e) => { tokenClick(e, token.id, props.data.id); e.stopPropagation() }}><Token tid={token.id} type={token.type} owner={token.owner} rank={token.rank} renderSvgTag={false}></Token></g> })}
    {props.data.units.map((unit, id) => <Unit key={id} owner={unit.owner}></Unit>)}
    {props.children}
  </Hexagon>
};

export default Hex;