import DiscordEventListener from "../../src/abstracts/DiscordEventListener"
import MemberJoinGuildEvent from "../../src/events/MemberJoinGuildEvent"
import Logger from '../../src/infrastructures/Logger'
import appSettings from '../../app.settings.json'
import { DeepMockProxy, mockDeep } from "jest-mock-extended"
import { GuildMember, TextChannel } from "discord.js"
import { GlobalFonts } from "@napi-rs/canvas"
import { join } from "path"
import { writeFileSync } from "fs"

GlobalFonts.registerFromPath(join(__dirname, 'resources', 'fonts', 'Poppins-Bold.ttf'), 'Poppins')

describe("MemberJoinGuildEvent", () => {
  let event: DiscordEventListener<any>
  let guildMemberMock: DeepMockProxy<GuildMember>
  let textChannelMock: DeepMockProxy<TextChannel>

  beforeEach(() => {
    event = new MemberJoinGuildEvent(new Logger)
    guildMemberMock = mockDeep<GuildMember>()
    textChannelMock = mockDeep<TextChannel>()
  })

  test("execute event success", async () => {
    guildMemberMock.guild.channels.cache.get.mockReturnValue(textChannelMock)
    guildMemberMock.user.username = 'username'
    guildMemberMock.user.displayAvatarURL.mockReturnValue('https://picsum.photos/512/512')
    textChannelMock.isSendable.mockReturnValue(true)
    // @ts-ignore
    textChannelMock.send.mockImplementation((message: any): Promise<void> => {
      writeFileSync(join(__dirname, '..', '__test__', 'welcome-banner.png'), message.files[0].attachment)
    })

    await event.execute(guildMemberMock)

    expect(guildMemberMock.guild.channels.cache.get).toHaveBeenCalledWith(appSettings.channels.gate.id)
    expect(guildMemberMock.user.username).toBe('username')
    expect(guildMemberMock.user.displayAvatarURL).toHaveBeenCalled()
    expect(textChannelMock.send).toHaveBeenCalledWith({
      embeds: expect.anything(),
      files: expect.anything()
    })
  })
})