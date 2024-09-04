import {GameOptions} from './Game.options'
import {TokenType} from '../Component/Token'
import { GetUniqueId } from '../Utils/Objects';
export function setupGame (options : GameOptions | null) {
    return () => {
        var startingPool : TokenType[] = [
            {id: GetUniqueId(), type: "A", owner: null, rank: null},
            {id: GetUniqueId(), type: "B", owner: null, rank: null},
            {id: GetUniqueId(), type: "C", owner: null, rank: null},
            {id: GetUniqueId(), type: "D", owner: null, rank: null},
        ]
        
        const mapRows = 5;
        const mapColumns = 7;

        var map : any = [];
        var count = 0;
        for(var i = 0; i < mapRows; i++){
            var row : any = [];
            for(var j = 0; j < mapColumns + (i % 2); j++){
                row.push(count++);
            }
            map.push(row)
        }

        return {
            map: map,
            actionPool: startingPool
        }
    }
}

type PlayerData = {
    availableActions: Array<TokenType>
}

// define a function to initialize each player’s state
export function playerSetup(playerID) { 
    return {
        availableActions: [{id: GetUniqueId(), type: playerID, owner: playerID, rank: null}]
    }
 };

// filter data returned to each client to hide secret state (OPTIONAL)
export function playerView(players, playerID) { 
    var scrubbedData = {};

    function hideSecrets(player : PlayerData){
        var maskedPlayer = {...player};
        // Mark tokens as unknown:
        maskedPlayer.availableActions = player.availableActions.map((a) => ({id: GetUniqueId(), type: "X", owner: null, rank: null}));

        return maskedPlayer;
    }

    for(var player in players){
        if (player === playerID){
            scrubbedData[player] = players[player];
        }
        else {
            scrubbedData[player] = hideSecrets(players[player]);
        }
    }
    console.log(scrubbedData);
    return scrubbedData;
}