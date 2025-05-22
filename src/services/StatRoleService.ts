import { Client, Guild } from "discord.js"
import { injectable } from "inversify"
import config from "../infrastructures/config"
import Logger from "../infrastructures/Logger"

type RoleStatMap = {
  roleId: string
  channelId: string
  label: string
}

@injectable()
class StatRoleService {
  private readonly intervalMs = 5 * 60 * 1000 // 5 menit
  private previousCounts: Record<string, number> = {}

  private readonly mappings: RoleStatMap[] = [
    { roleId: "1291365506724528179", channelId: "1374495701391769662", label: "C3 Core" },
    { roleId: "1358699748906766467", channelId: "1374495769847009460", label: "C3 Node" },
    { roleId: "1358741348584390790", channelId: "1374495818194882661", label: "C3 Catalyst" },
    { roleId: "1351752357263704156", channelId: "1374495856413376636", label: "C3 Collab" },
  ]

  public constructor(private logger: Logger) {
    this.logger.setContextName(this.constructor.name)
  }

  public async initialize(client: Client<true>): Promise<void> {
    const guildId = config.get("c3.guild.id")
    const guild = await client.guilds.fetch(guildId)
    await guild.members.fetch()

    // Cek awal
    await this.updateAll(guild)

    // Cek berkala
    setInterval(() => this.updateAll(guild), this.intervalMs)
  }

  private async updateAll(guild: Guild): Promise<void> {
    for (const map of this.mappings) {
      try {
        const count = guild.members.cache.filter((m) =>
          m.roles.cache.has(map.roleId)
        ).size

        const lastCount = this.previousCounts[map.roleId] ?? -1

        if (count !== lastCount) {
          this.previousCounts[map.roleId] = count
          const channel = await guild.channels.fetch(map.channelId)
          if (channel && "setName" in channel) {
            const newName = `${map.label}: ${count}`
            if (channel.name !== newName) {
              await channel.setName(newName)
              this.logger.info(`[StatRoleService] ${map.label} updated to "${newName}"`)
            }
          }
        } else {
          this.logger.info(`[StatRoleService] ${map.label} count unchanged (${count})`)
        }
      } catch (error) {
        this.logger.error(`[StatRoleService] Error updating ${map.label}: ${error}`)
      }
    }
  }
}

export default StatRoleService
