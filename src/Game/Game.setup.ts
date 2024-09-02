import {GameOptions} from './Game.options'

export function setupGame (options : GameOptions | null) {
    return () => {
        var startingPool = ["A", "B", "C", "D"]
        
        return {
            cells: Array(9).fill(null),
            actionPool: startingPool
        }
    }
}

type PlayerData = {
    availableActions: Array<string>
}

// define a function to initialize each player’s state
export function playerSetup(playerID) { 
    return {
        availableActions: Array(3).fill(playerID)
    }
 };

// filter data returned to each client to hide secret state (OPTIONAL)
export function playerView(players, playerID) { 
    var scrubbedData = {};

    function hideSecrets(player : PlayerData){
        var maskedPlayer = structuredClone(player);
        // Mark tokens as unknown:
        maskedPlayer.availableActions = player.availableActions.map((a) => "X");

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