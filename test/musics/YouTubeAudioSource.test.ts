import { DeepMockProxy, mock, mockDeep, MockProxy } from "jest-mock-extended"
import { ChildProcessByStdio, spawn } from "child_process"
import { Readable } from "stream"
import container from '../../src/infrastructures/container'
import Logger from '../../src/infrastructures/Logger'
import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioResource, StreamType } from "@discordjs/voice"
import YouTubeAudioSource from "../../src/musics/YouTubeAudioSource"
import DiscordReplyException from "../../src/exceptions/DiscordReplyException"

let processMock: DeepMockProxy<ChildProcessByStdio<null, Readable, null>> = mockDeep()
let audioResourceMock: DeepMockProxy<AudioResource> = mockDeep()

jest.mock('child_process', () => ({
  spawn: jest.fn().mockImplementation(() => {
    processMock = mockDeep()

    return processMock
  }),
}))

jest.mock('@discordjs/voice', () => ({
  ...jest.requireActual('@discordjs/voice'),
  createAudioResource: jest.fn().mockImplementation(() => {
    audioResourceMock = mockDeep<AudioResource>()

    return audioResourceMock
  }),
}))

beforeAll(() => {
  container.bind(Logger).toSelf()
})

describe('YouTubeAudioSource', () => {
  let audio: YouTubeAudioSource
  let audioPlayerMock: DeepMockProxy<AudioPlayer>
  let audioUrl: string

  beforeEach(() => {
    audioPlayerMock = mockDeep<AudioPlayer>()
    audioUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    audio = new YouTubeAudioSource(audioPlayerMock, audioUrl)
  })

  describe('play', () => {
    test('starts playing on first call', async () => {
      await audio.play()

      expect(spawn).toHaveBeenCalledWith("yt-dlp", [
        "-o", "-",
        "-f", "bestaudio",
        "--no-playlist",
        "-q", "--no-warnings",
        "--no-cache-dir",
        "--quiet",
        "--audio-format",
        "--extract-audio",
        "",
        audioUrl
      ], { stdio: ['ignore', 'pipe', 'ignore'] })
      expect(audioPlayerMock.play).toHaveBeenCalledWith(audioResourceMock)
      expect(createAudioResource).toHaveBeenCalledWith(processMock.stdout, {
        inputType: StreamType.Arbitrary
      })
    })

    test('restarts playing if already playing', async () => {
      audio['elapsedTime'] = 10

      await audio.play()

      expect(spawn).toHaveBeenCalledWith("yt-dlp", [
        "-o", "-",
        "-f", "bestaudio",
        "--no-playlist",
        "-q", "--no-warnings",
        "--no-cache-dir",
        "--quiet",
        "--audio-format",
        "--extract-audio",
        "--start-time=10",
        audioUrl
      ], { stdio: ['ignore', 'pipe', 'ignore'] })
      expect(audioPlayerMock.play).toHaveBeenCalledWith(audioResourceMock)
      expect(createAudioResource).toHaveBeenCalledWith(processMock.stdout, {
        inputType: StreamType.Arbitrary
      })
    })

    test('throws error if yt-dlp fails', async () => {
      (spawn as jest.Mock).mockImplementationOnce(() => {
        throw new Error('yt-dlp failed')
      })

      expect(() => audio.play()).toThrow(DiscordReplyException)
    })
  })

  describe('pause', () => {
    test('pauses the audio player and kills the process', () => {
      audio['startTimestamp'] = 1000
      audio['elapsedTime'] = 5
      audio['process'] = processMock
      audioPlayerMock.state.status = AudioPlayerStatus.Playing
      audioPlayerMock.pause.mockReturnValue(true)

      audio.pause()

      expect(audioPlayerMock.pause).toHaveBeenCalled()
      expect(processMock.kill).toHaveBeenCalledWith('SIGKILL')
    })

    test('does not pause if audio player is not playing', () => {
      audioPlayerMock.state.status = AudioPlayerStatus.Idle

      audio.pause()

      expect(audioPlayerMock.pause).not.toHaveBeenCalled()
    })
  })

  describe('stop', () => {
    test('stops the audio player and kills the process', () => {
      audio['process'] = processMock
      audioPlayerMock.state.status = AudioPlayerStatus.Playing
      audioPlayerMock.stop.mockReturnValue(true)

      audio.stop()

      expect(audioPlayerMock.stop).toHaveBeenCalled()
      expect(processMock.kill).toHaveBeenCalledWith('SIGKILL')
    })

    test('does not stop if audio player is not playing', () => {
      audioPlayerMock.state.status = AudioPlayerStatus.Idle

      audio.stop()

      expect(audioPlayerMock.stop).not.toHaveBeenCalled()
    })
  })
})