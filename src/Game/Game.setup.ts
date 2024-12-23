import {GameOptions} from './Game.options'
import {TokenType} from '../Component/Token'
import { GetUniqueId } from '../Utils/Objects';
import Action from '../Helpers/Actions';
import Board from '../Board';
import { HexType } from '../Component/Hex/Hex';
import { Hexes } from '../Helpers/Hexes';
import { Ctx } from 'boardgame.io';
export type GameStateType = {
    map: HexType[],
    actionPool: TokenType[],
    players: PlayerData[],
    activeCombatHex: string | null
}

export function setupGame (options : GameOptions) {
    return ({ctx}, setupData) => {
        var startingPool : TokenType[] = [
            {id: GetUniqueId(), type: Action.Attack, owner: null, rank: null},
            {id: GetUniqueId(), type: Action.Defend, owner: null, rank: null},
            {id: GetUniqueId(), type: Action.Gather, owner: null, rank: null},
            {id: GetUniqueId(), type: Action.Aid, owner: null, rank: null},
        ]
        
        var map : HexType[] = Board.HexMap.map((tile) => { return {id: GetUniqueId(), tokens: [], units: [], tile: {q: tile.q, r: tile.r, s: tile.s}, type: Hexes.Standard} satisfies HexType });

        var mineHexes = [5,7,29,31];
        mineHexes.forEach(element => {
            map[element].type = Hexes.Mine;
        });

        var players : PlayerData[] = [];
        for(var i = 0; i < ctx.numPlayers; i++){
            players.push(playerSetup(i));
        }

        return {
            map: map,
            actionPool: startingPool,
            players,
            activeCombatHex: null
        } satisfies GameStateType
    }
}

type PlayerData = {
    availableActions: Array<TokenType>,
    selectedToken: string | null,
    gold: number
}

// define a function to initialize each player’s state
function playerSetup(playerID) { 
    return {
        availableActions: [{id: GetUniqueId(), type: Action.Attack, owner: playerID + "", rank: null}, {id: GetUniqueId(), type: Action.Gather, owner: playerID + "", rank: null}, {id: GetUniqueId(), type: Action.Aid, owner: playerID + "", rank: null}],
        selectedToken: null,
        gold: 10
    } satisfies PlayerData
 };

// filter data returned to each client to hide secret state (OPTIONAL)
export function playerView({G, ctx, playerID} : {G: GameStateType, ctx : Ctx, playerID: string}) { 
    var players = G.players
    var scrubbedData = {};

    function hideSecrets(player : PlayerData){
        var maskedPlayer = {...player};
        // Mark tokens as unknown:
        maskedPlayer.availableActions = player.availableActions.map((a) => ({id: a.id, type: Action.Unknown, owner: a.owner, rank: null}));
        
        return maskedPlayer;
    }

    var map = G.map.map((hex) => (
        {
            ...hex, 
            tokens: hex.tokens.map((token) => ({id: token.id, type: playerID === token.owner || ctx.phase === "attackResolutionPhase" ? token.type : Action.Unknown, owner: token.owner, rank: null}))
        }));

    for(var player in players){
        if (player === playerID){
            scrubbedData[player] = players[player];
        }
        else {
            scrubbedData[player] = hideSecrets(players[player]);
        }
    }
    return {...G, map: map, players: scrubbedData};
}