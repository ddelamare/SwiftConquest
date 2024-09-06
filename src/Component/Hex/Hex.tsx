import * as React from 'react';
import Token, { TokenType } from '../Token';
import { Hexagon, Text } from 'react-hexgrid';
import { HexagonProps } from 'react-hexgrid/lib/Hexagon/Hexagon';
import { Hexes } from '../../Helpers/Data/Hexes';
type HexProps = {
    children: string | JSX.Element | JSX.Element[] | null,
    onClick: React.MouseEventHandler<SVGAElement>;
    data: HexType
  }

  export type HexType = {
    id: string,
    tokens: TokenType[],
    type: Hexes,
    tile: HexagonProps
  }

class Hex extends React.Component<HexProps> {
    render() {

        // return <div className='hex' onClick={this.props.onClick}>
        //     {this.props.data.tokens.map((token, id) => {return <Token type={token.type} owner={token.owner} rank={token.rank} ></Token>})}
        //     {this.props.children}
        // </div>
        return <Hexagon className='hex' key={this.props.data.id} onClick={this.props.onClick} q={this.props.data.tile.q} r={this.props.data.tile.r} s={this.props.data.tile.s}>
                {this.props.data.tokens.map((token, id) => {return <Token type={token.type} owner={token.owner} rank={token.rank} renderSvgTag={false}></Token>})}
                {this.props.children}
        </Hexagon>
    }
}

export default Hex;