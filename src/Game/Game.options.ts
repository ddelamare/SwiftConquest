

export type GameOptions = {
    startingTokens: any[],
    gameMode: string,
    tokensToDraft: number,
}

export const defaultOptions: GameOptions = {
    startingTokens: [],
    gameMode: '',
    tokensToDraft: 5,
}
