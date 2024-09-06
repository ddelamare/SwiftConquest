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
    if (owner === "0"){
        fillColor = "lightgreen";
    }
    if (owner === "1"){
        fillColor = "lightblue";
    }

    const BaseTag = renderSvgTag? 'svg' : 'g'


    return (
        <BaseTag height="100" width="100" viewBox="-50 -50 100 100">
            <circle r={renderSvgTag? 50 : 5} fill={fillColor}>
            </circle>
            <text dominantBaseline="middle" textAnchor="middle">{Action[type]}</text>            
        </BaseTag> 
    )
} 