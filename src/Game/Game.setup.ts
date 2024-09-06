import {GameOptions} from './Game.options'
import {TokenType} from '../Component/Token'
import { HexType } from '../Component/Hex/Hex';
import { GetUniqueId } from '../Utils/Objects';
import Action from '../Helpers/Data/Actions';
import Board from '../Board';
export function setupGame (options : GameOptions) {
    return () => {
        var startingPool : TokenType[] = [
            {id: GetUniqueId(), type: Action.Attack, owner: null, rank: null},
            {id: GetUniqueId(), type: Action.Defend, owner: null, rank: null},
            {id: GetUniqueId(), type: Action.Gather, owner: null, rank: null},
            {id: GetUniqueId(), type: Action.Aid, owner: null, rank: null},
        ]
        
        var map = Board.HexMap.map((tile) => { return {id: GetUniqueId(), tokens: [], tile: {q: tile.q, r: tile.r, s: tile.s}} });

        var players : PlayerData[] = [];
        for(var i = 0; i < options.numPlayers; i++){
            players.push(playerSetup(i));
        }

        return {
            map: map,
            actionPool: startingPool,
            players
        }
    }
}

type PlayerData = {
    availableActions: Array<TokenType>,
    selectedToken: string | null
}

// define a function to initialize each player’s state
function playerSetup(playerID) { 
    return {
        availableActions: [{id: GetUniqueId(), type: Action.Attack, owner: playerID + "", rank: null}],
        selectedToken: null
    } satisfies PlayerData
 };

// filter data returned to each client to hide secret state (OPTIONAL)
export function playerView(G, playerID) { 
    var players = G.players
    var scrubbedData = {};

    function hideSecrets(player : PlayerData){
        var maskedPlayer = {...player};
        // Mark tokens as unknown:
        maskedPlayer.availableActions = player.availableActions.map((a) => ({id: GetUniqueId(), type: Action.Unknown, owner: null, rank: null}));

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
    return {...G, players: scrubbedData};
}