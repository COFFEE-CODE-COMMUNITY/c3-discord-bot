import YouTubeService from "../../src/services/YouTubeService"
import Logger from '../../src/infrastructures/Logger'

describe('YouTubeService', () => {
  let youtubeService: YouTubeService

  beforeEach(() => {
    youtubeService = new YouTubeService(new Logger)
  })

  describe('getMusicMetadata', () => {
    test('url is from youtube video', async () => {
      const musicMetadata = await youtubeService.getMusicMetadata('https://youtu.be/1lYb9nLO_FY?si=Ft_e-s03T-09HLPd')

      expect(musicMetadata).toEqual({
        artist: 'eill official',
        title: 'eill | フィナーレ。 (Official Music Video)',
        duration: expect.any(Number),
        image: expect.any(URL),
      })
    }, 10000)

    test('url is from youtube music', async () => {
      const musicMetadata = await youtubeService.getMusicMetadata('https://music.youtube.com/watch?v=WEYKF44MWNU&si=XRC_tGGoPT6WCUrq')

      expect(musicMetadata).toEqual({
        artist: '幾田りら',
        title: '恋風',
        duration: 182,
        image: expect.any(URL),
      })
    }, 10000)
  })
})