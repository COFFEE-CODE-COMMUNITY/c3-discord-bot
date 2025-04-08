import { ClientCredentialsStrategy, SpotifyApi } from "@spotify/web-api-ts-sdk"
import config from "../infrastructures/config"
import { injectable } from "inversify"

@injectable()
class SpotifyService extends SpotifyApi {

  public constructor() {
    super(new ClientCredentialsStrategy(config.get('spotify.clientId'), config.get('spotify.clientSecret')))
  }
}

export default SpotifyService