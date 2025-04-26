import { ChatInputCommandInteraction } from 'discord.js'
import ClearStickyHandler from '../../../src/commands/sticky/ClearStickyHandler'
import Database from "../../../src/infrastructures/Database"
import { mockDeep, DeepMockProxy } from "jest-mock-extended"

describe('ClearStickyHandler', () => {
  let clearStickyHandler: ClearStickyHandler
  let db: DeepMockProxy<Database>
  let interaction: DeepMockProxy<ChatInputCommandInteraction>

  beforeEach(() => {
    db = mockDeep()

    clearStickyHandler = new ClearStickyHandler(db)

    interaction = mockDeep()
    interaction.guildId = "123456789012345678"
  })

  it('should delete all sticky messages and reply to the interaction', async () => {
    await clearStickyHandler.handle(interaction)

    expect(db.stickyMessage.deleteMany).toHaveBeenCalledWith({
      where: { guildId: "123456789012345678" }
    })
    expect(interaction.reply).toHaveBeenCalledWith({
      content: "All sticky messages have been cleared on this server.",
      flags: "Ephemeral"
    })
  })
})