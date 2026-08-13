import * as React from 'react';
import { Hexagon } from 'react-hexgrid';
import { HexTerrain, Phase } from '../../Domain/Model';
import type { HexState } from '../../Domain/Model';
import { findTokenOnMap } from '../../Domain/Selectors';
import { IsPlayerActive } from '../../Helpers/Players';
import { GameClientContext } from '../../UI/GameClientContext';
import Token from '../Token';
import Unit from '../Unit/Unit';

type HexProps = {
  children: string | JSX.Element | JSX.Element[] | null;
  onClick: (event: React.MouseEvent<SVGElement>) => void;
  data: HexState;
  isHighlighted: boolean;
};

export type HexType = HexState;

const Hex = (props: HexProps) => {
  const client = React.useContext(GameClientContext);
  const tokenClick = (event: React.MouseEvent<SVGGElement>, tokenID: string) => {
    if (!client) return;
    if (client.ctx.phase === Phase.ActionPlacement) client.moves.clearToken(tokenID, props.data.id);
    if (client.ctx.phase === Phase.AttackResolution) {
      const token = findTokenOnMap(client.G, tokenID);
      if (token && IsPlayerActive(client.ctx, token.owner)) client.moves.selectToken(tokenID);
      else props.onClick(event);
    }
  };

  const sumCoord = Math.abs(((props.data.tile.q - props.data.tile.r) + 9) % 3);
  const colorClass = sumCoord === 0 ? 'hex-std ' : sumCoord === 1 ? 'hex-alt ' : 'hex-alt-2 ';
  return (
    <Hexagon
      className={`hex ${colorClass}${props.isHighlighted ? 'hex-highlight ' : ''}`}
      onClick={props.onClick}
      q={props.data.tile.q}
      r={props.data.tile.r}
      s={props.data.tile.s}
    >
      {props.data.type === HexTerrain.Mine ? <circle fill="#mineHex" r="5" /> : null}
      {props.data.tokens.map((token) => (
        <g key={token.id} style={{ transform: 'scale(75%)' }} onClick={(event) => { tokenClick(event, token.id); event.stopPropagation(); }}>
          <Token tid={token.id} type={token.type} owner={token.owner} rank={token.rank} renderSvgTag={false} />
        </g>
      ))}
      {props.data.units.map((unit) => <Unit key={unit.id} owner={unit.owner} />)}
      {props.children}
    </Hexagon>
  );
};

export default Hex;
