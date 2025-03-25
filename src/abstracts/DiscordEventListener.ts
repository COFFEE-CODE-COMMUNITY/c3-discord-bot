import { ClientEvents } from "discord.js"

abstract class DiscordEventListener<E extends keyof ClientEvents> {
  public once: boolean = false
  public abstract readonly event: E
  public abstract execute(...args: ClientEvents[E]): void | Promise<void>
}

export default DiscordEventListener