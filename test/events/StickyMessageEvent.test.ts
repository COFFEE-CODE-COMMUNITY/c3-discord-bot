import { Message, OmitPartialGroupDMChannel } from "discord.js"
import { DeepMockProxy, mockDeep } from "jest-mock-extended"
import StickyMessageEvent from "../../src/events/StickyMessageEvent"
import Database from "../../src/infrastructures/Database"
import { StickyMessage } from "@prisma/client"

describe('StickyMessageEvent', () => {
  let stickyMessageEvent: StickyMessageEvent
  let db: DeepMockProxy<Database>
  let interaction: DeepMockProxy<OmitPartialGroupDMChannel<Message>>

  beforeEach(() => {
    db = mockDeep()

    stickyMessageEvent = new StickyMessageEvent(db)

    interaction = mockDeep()
    interaction.author.bot = false
    interaction.channelId = "987654321098765432"
    interaction.channel.messages.fetch.mockResolvedValue({
      id: "123456789012345678",
      delete: jest.fn(),
    } as any)
  })

  it('should not execute if the author is a bot', async () => {
    interaction.author.bot = true

    await stickyMessageEvent.execute(interaction)

    expect(db.stickyMessage.findUnique).not.toHaveBeenCalled()
  })

  it('should not execute if there is no sticky message', async () => {
    db.stickyMessage.findUnique.mockResolvedValue(null)

    await stickyMessageEvent.execute(interaction)

    expect(db.stickyMessage.findUnique).toHaveBeenCalledWith({
      where: { channelId: "987654321098765432" },
      select: {
        messageId: true,
        message: true
      }
    })
  })

  it('should delete the sticky message and send a new one', async () => {
    interaction.channelId = crypto.randomUUID()

    db.stickyMessage.findUnique.mockResolvedValue({
      messageId: "123456789012345678",
      message: "Hello, world!"
    } as any)

    interaction.channel.messages.fetch

    await stickyMessageEvent.execute(interaction)

    expect(db.stickyMessage.findUnique).toHaveBeenCalledWith({
      where: { channelId: interaction.channelId },
      select: {
        messageId: true,
        message: true
      }
    })
    expect(interaction.channel.messages.fetch).toHaveBeenCalledWith("123456789012345678")
    expect(interaction.channel.send).toHaveBeenCalledWith("Hello, world!")
    expect(db.stickyMessage.update).toHaveBeenCalledWith({
      where: { channelId: "987654321098765432" },
      data: {
        messageId: "123456789012345678",
      }
    })
  })
})