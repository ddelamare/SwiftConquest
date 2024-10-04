import { Ctx } from "boardgame.io"
import { GameStateType } from "./Game.setup"
import { EventsAPI } from "boardgame.io/dist/types/src/plugins/plugin-events"

export interface MovePropsType  {
    G : GameStateType,
    ctx: Ctx,
    events: EventsAPI
    playerID: string 
}