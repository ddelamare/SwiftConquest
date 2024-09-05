import * as React from 'react';
import Token, { TokenType } from '../Token';
type HexProps = {
    children: string | JSX.Element | JSX.Element[],
    onClick: React.MouseEventHandler<HTMLDivElement>;
    data: HexType
  }

  export type HexType = {
    id: string,
    tokens: TokenType[],
    type: Hexes
  }

class Hex extends React.Component<HexProps> {
    render() {
        return <div className='hex' onClick={this.props.onClick}>
            {this.props.data.tokens.map((token, id) => {return <Token type={token.type} owner={token.owner} rank={token.rank} ></Token>})}
            {this.props.children}
        </div>
    }
}

export default Hex;