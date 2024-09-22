import * as React from 'react';
import Token, { TokenType } from '../Token';
import { Hexagon, Text } from 'react-hexgrid';
import { HexagonProps } from 'react-hexgrid/lib/Hexagon/Hexagon';
import { Hexes } from '../../Helpers/Data/Hexes';
import  Unit, { UnitType }  from '../Unit/Unit'
import {MoveContext} from '../../Board'
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
    tile: HexagonProps
  }

const Hex = ( props : HexProps )  => {

    var moves = React.useContext<any>(MoveContext);
    var tokenClick = (id, hexId) => moves.clearToken(id, hexId);
    // this calculates the color based on https://www.redblobgames.com/x/1902-hexagon-coloring/
    var sumCoord = Math.abs(((props.data.tile.q - props.data.tile.r) + 9) % 3); 
    return <Hexagon className={"hex " + (sumCoord === 0 ? "hex-std" : sumCoord === 1 ? "hex-alt" : "hex-alt-2")} key={props.data.id} onClick={props.onClick} q={props.data.tile.q} r={props.data.tile.r} s={props.data.tile.s}>
                {props.data.type == Hexes.Mine? <circle fill='#mineHex' r="5"></circle> : ''}
                {props.data.tokens.map((token, id) => {return <g onClick={(e) => { tokenClick(token.id, props.data.id); e.stopPropagation()}}><Token type={token.type} owner={token.owner} rank={token.rank} renderSvgTag={false}></Token></g>})}
                {props.data.units.map((unit, id) => <Unit owner={unit.owner}></Unit>)}
                {props.children}
            </Hexagon>
};

export default Hex;