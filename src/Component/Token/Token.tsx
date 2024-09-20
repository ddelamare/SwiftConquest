import * as React from 'react'
import './Token.css'
import '../Component.css'
import Action from '../../Helpers/Data/Actions'
export type TokenType = {
    id: string,
    type: Action,
    owner: string | null,
    rank: number | null}

export default function Token({type, owner, rank, renderSvgTag}) {

    var fillColor = "gray";
    if (owner) {
        fillColor = `var(--player-${owner}-color)`
    }

    const BaseTag = renderSvgTag? 'svg' : 'g'

    return (
        <BaseTag className="shadow" height="100" width="100" viewBox="-50 -50 100 100">
            <circle className='token' r={renderSvgTag? 50 : 5} fill={fillColor}>
            </circle>
            <circle className='token' r={renderSvgTag? 40 : 4} fill={`url(#${Action[type].toLowerCase()}Token)`}>
            </circle>
            {/* <text dominantBaseline="middle" textAnchor="middle" fill='white'>{Action[type]}</text>             */}
        </BaseTag> 
    )
} 