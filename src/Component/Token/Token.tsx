import * as React from 'react';
import { Action } from '../../Domain/Model';
import type { ActionToken } from '../../Domain/Model';
import { GameClientContext } from '../../UI/GameClientContext';
import '../Component.css';
import './Token.css';

export type TokenType = ActionToken;

interface TokenProps {
  tid: string;
  type: Action;
  owner: string | null;
  rank: number | null;
  renderSvgTag: boolean;
}

export default function Token({ tid, type, owner, renderSvgTag }: TokenProps) {
  const client = React.useContext(GameClientContext);
  const player = client?.playerID ? client.G.players[client.playerID] : undefined;
  const fillColor = owner ? `var(--player-${owner}-color)` : 'gray';
  const BaseTag = renderSvgTag ? 'svg' : 'g';

  return (
    <BaseTag className="shadow" height="100" width="100" viewBox="-50 -50 100 100">
      <circle className="token" r={renderSvgTag ? 50 : 5} fill={fillColor} filter={tid === player?.selectedToken ? 'url(#SelectGlow)' : ''} />
      <circle className="token" r={renderSvgTag ? 40 : 4} fill={`url(#${Action[type].toLowerCase()}Token)`} />
    </BaseTag>
  );
}
