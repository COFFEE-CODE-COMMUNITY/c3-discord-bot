import { SpotifyApi } from "@spotify/web-api-ts-sdk"
import config from "../infrastructures/config"

class SpotifyService {
  private readonly spotify: SpotifyApi

  public constructor() {
    this.spotify = SpotifyApi.withClientCredentials(config.get('spotify.clientId'), config.get('spotify.clientSecret'))
  }

  public getSpotify() {
    return this.spotify
  }

  private static instance: SpotifyApi

  public static getSpotifyAPI() {
    if (!SpotifyService.instance) {
      const spotifyService = new SpotifyService()
      SpotifyService.instance = spotifyService.getSpotify()
    }

    return SpotifyService.instance
  }
}

export default SpotifyService