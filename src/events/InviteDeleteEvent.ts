import { Events, Invite } from "discord.js"
import { injectable } from "inversify"
import DiscordEventListener from "../abstracts/DiscordEventListener"
import { inviteCaches } from "./ClientReadyEvent"
import Logger from "../infrastructures/Logger"

@injectable()
class InviteDeleteEvent extends DiscordEventListener<Events.InviteDelete> {
  public event = Events.InviteDelete as const
  private logger: Logger

  public constructor(logger: Logger) {
    super()
    this.logger = logger
    this.logger.setContextName(this.constructor.name)
  }

  public async execute(invite: Invite): Promise<void> {
    const guild = invite.guild
    if (!guild) {
      this.logger.warn("[InviteDeleteEvent] Deleted invite has no associated guild.")
      return
    }

    const guildId = guild.id
    const existingCache = inviteCaches.get(guildId)
    if (existingCache) {
      existingCache.delete(invite.code)
      this.logger.debug(`[InviteTracker] Removed invite "${invite.code}" from cache for guild "${guild.name}".`)
    }
  }
}

export default InviteDeleteEvent
