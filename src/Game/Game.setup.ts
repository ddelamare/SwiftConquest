import {GameOptions} from './Game.options'

export function setupGame (options : GameOptions | null) {
    return () => {
        return {
            cells: Array(9).fill(null)
        }
    }
}

export default setupGame;
