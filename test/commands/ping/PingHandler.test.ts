import PingHandler from "../../../src/commands/ping/PingHandler"
import { DeepMockProxy, mockDeep } from "jest-mock-extended"
import { ChatInputCommandInteraction } from "discord.js"

describe('PingHandler', () => {
  let handler: PingHandler

  beforeEach(() => {
    handler = new PingHandler()
  })

  describe('handle', () => {
    let interaction: DeepMockProxy<ChatInputCommandInteraction>

    beforeEach(() => {
      interaction = mockDeep<ChatInputCommandInteraction>()
    })

    it('should reply with "Pong!"', async () => {
      await handler.handle(interaction)

      expect(interaction.options.getBoolean).toHaveBeenCalledWith("ephemeral")
      expect(interaction.reply).toHaveBeenCalledWith({ content: "Pong!", ephemeral: false })
    })

    it('should reply with "Pong!" and set ephemeral to true', async () => {
      interaction.options.getBoolean.mockReturnValue(true as never)

      await handler.handle(interaction)

      expect(interaction.options.getBoolean).toHaveBeenCalledWith("ephemeral")
      expect(interaction.reply).toHaveBeenCalledWith({ content: "Pong!", ephemeral: true })
    })
  })
})