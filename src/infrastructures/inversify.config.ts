import { Container } from "inversify"
import Logger from "./Logger"
import BotClient from "./BotClient"

export const container = new Container()

container.bind(Logger).toSelf().inTransientScope()
container.bind(BotClient).toSelf().inSingletonScope()