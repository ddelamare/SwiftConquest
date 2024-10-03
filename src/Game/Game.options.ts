

type GameOptions = {
    startingTokens: any[],
    gameMode: string,
    tokensToDraft: number,
}

var defaultOptions = {
    startingTokens: [],
    gameMode: '',
    tokensToDraft: 5,
} satisfies GameOptions

export { defaultOptions, GameOptions }