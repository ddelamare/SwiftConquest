import * as React from 'react'
import './Token.css'


export default function Token({type, owner, location}) {

    var fillColor = "gray";
    var ctx;
    if (owner === "0"){
        fillColor = "green";
    }
    if (owner === "1"){
        fillColor = "lightblue";
    }

    return (
        <svg height="100" width="100" xmlns="http://www.w3.org/2000/svg">
            <circle r="45" cx="50" cy="50" fill={fillColor} />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">{type}</text>            
        </svg> 
    )
} 