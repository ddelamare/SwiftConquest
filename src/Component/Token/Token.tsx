import * as React from 'react'
import './Token.css'
import '../Component.css'
import Action from '../../Helpers/Actions'
import { Ctx } from 'boardgame.io'
import { GameCtx, GameState, PlayerID } from '../../Board'
import { GameStateType } from '../../Game/Game.setup'
export type TokenType = {
    id: string,
    type: Action,
    owner: string | null,
    rank: number | null}

export default function Token({tid, type, owner, rank, renderSvgTag}) {

    var fillColor = "gray";
    if (owner) {
        fillColor = `var(--player-${owner}-color)`
    }

    const BaseTag = renderSvgTag? 'svg' : 'g'
    var gameState = React.useContext<GameStateType | null>(GameState);
    var playerID = React.useContext<string | null>(PlayerID);
    var player = gameState?.players[playerID!];
    return (
        <BaseTag className="shadow" height="100" width="100" viewBox="-50 -50 100 100">
            <circle className='token' r={renderSvgTag? 50 : 5} fill={fillColor} filter={tid === player.selectedToken? 'url(#SelectGlow)' : ''}>
            </circle>
            <circle className='token' r={renderSvgTag? 40 : 4} fill={`url(#${Action[type].toLowerCase()}Token)`}>
            </circle>
            {/* <text dominantBaseline="middle" textAnchor="middle" fill='white'>{Action[type]}</text>             */}
        </BaseTag> 
    )
} 