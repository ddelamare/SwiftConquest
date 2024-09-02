

type GameOptions = {
    startingTokens: any[],
    gameMode: string,
    tokensToDraft: number,
    numPlayers: number
}

var defaultOptions = {
    startingTokens: [],
    gameMode: '',
    tokensToDraft: 5,
    numPlayers: 2
} satisfies GameOptions

export { defaultOptions, GameOptions }