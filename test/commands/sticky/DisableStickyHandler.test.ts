import { DeepMockProxy, mockDeep } from "jest-mock-extended"
import DisableStickyHandler from "../../../src/commands/sticky/DisableStickyHandler"
import Database from "src/infrastructures/Database"
import { ChatInputCommandInteraction } from "discord.js"

describe('DisableStickyHandler', () => {
  let disableStickyHandler: DisableStickyHandler
  let db: DeepMockProxy<Database>
  let interaction: DeepMockProxy<ChatInputCommandInteraction>

  beforeEach(() => {
    db = mockDeep()

    disableStickyHandler = new DisableStickyHandler(db)

    interaction = mockDeep()
    interaction.guildId = "123456789012345678"
    interaction.channelId = "987654321098765432"
  })

  it('should delete the sticky message for the specified channel and reply to the interaction', async () => {
    await disableStickyHandler.handle(interaction)

    expect(db.stickyMessage.delete).toHaveBeenCalledWith({
      where: {
        channelId: "987654321098765432",
        guildId: "123456789012345678"
      }
    })
    expect(interaction.reply).toHaveBeenCalledWith({
      content: 'Sticky message disabled for <#987654321098765432>',
      flags: 'Ephemeral'
    })
  })

  it('should delete the sticky message for the current channel if no channel is specified', async () => {
    interaction.options.getChannel.mockReturnValueOnce(null)

    await disableStickyHandler.handle(interaction)

    expect(db.stickyMessage.delete).toHaveBeenCalledWith({
      where: {
        channelId: "987654321098765432",
        guildId: "123456789012345678"
      }
    })
    expect(interaction.reply).toHaveBeenCalledWith({
      content: 'Sticky message disabled for <#987654321098765432>',
      flags: 'Ephemeral'
    })
  })
})