import * as React from 'react'
import './Token.css'


export default function Token({type, owner, location}) {
    return (
        <svg height="100" width="100" xmlns="http://www.w3.org/2000/svg">
            <circle r="45" cx="50" cy="50" fill="red" />
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">{type}</text>            
        </svg> 
    )
} 