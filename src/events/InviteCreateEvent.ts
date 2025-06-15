import { Collection, Events, Invite } from "discord.js"
import { injectable } from "inversify"
import DiscordEventListener from "../abstracts/DiscordEventListener"
import { inviteCaches } from "./ClientReadyEvent"
import Logger from "../infrastructures/Logger"

@injectable()
class InviteCreateEvent extends DiscordEventListener<Events.InviteCreate> {
  public event = Events.InviteCreate as const
  private logger: Logger

  public constructor(logger: Logger) {
    super()
    this.logger = logger
    this.logger.setContextName(this.constructor.name)
  }

  public async execute(invite: Invite): Promise<void> {
    this.logger.debug(`[InviteCreate] Fired`)
    this.logger.debug(`[InviteCreateEvent] Event triggered for invite: ${invite.code}`)
    const guild = invite.guild
    if (!guild) {
      this.logger.warn("[InviteCreateEvent] Invite has no associated guild.")
      return
    }

    const guildId = guild.id
    const existingCache = inviteCaches.get(guildId) ?? new Collection<string, Invite>()
    existingCache.set(invite.code, invite)
    inviteCaches.set(guildId, existingCache)

    this.logger.debug(`[InviteTracker] Cached new invite "${invite.code}" for guild "${guild.name}".`)
  }
}

export default InviteCreateEvent
