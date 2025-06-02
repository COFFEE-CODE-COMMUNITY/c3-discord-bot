import DiscordEventListener from "../abstracts/DiscordEventListener"
import { Client, Events, Collection, Invite, Guild } from "discord.js"
import Logger from "../infrastructures/Logger"
import StatRoleService from "../services/StatRoleService"
import config from "../infrastructures/config"
import { injectable } from "inversify"

//Global variable for invite tracker feature
export const inviteCaches = new Map<string, Collection<string, Invite>>
const guildId = config.get("c3.guild.id")

@injectable()
class ClientReadyEvent extends DiscordEventListener<Events.ClientReady> {
  public event = Events.ClientReady as const

  public constructor(private logger: Logger, private statRoleService : StatRoleService) {
    super()

    this.logger.setContextName(this.constructor.name)
  }

  public async execute(client: Client<true>): Promise<void> {
    this.logger.info(`Logged in as ${client.user.tag}.`)
    this.logger.info('Discord bot is ready.')

    try {
      await this.statRoleService.initialize(client)
      this.logger.info("Stats Server Ready")
    } catch (error) {
      this.logger.error(`Failed to start stats server ${error}`)
    }

    //Invite tracker logic
    const guild = client.guilds.cache.get(guildId)
    if (!guild) {
      this.logger.error(`[InviteTracker] Guild with ID ${guildId} not found.`)
      return
    }

    try {
      const invites = await guild.invites.fetch()
      inviteCaches.set(guildId, invites)
      this.logger.info(`[InviteTracker] Cached invites for guild "${guild.name}"`)
    } catch(error) {
      this.logger.warn(`[InviteTracker] Could not fetch invites for guild "${guild.name}": ${error}`)
    }
  }
}

export default ClientReadyEvent