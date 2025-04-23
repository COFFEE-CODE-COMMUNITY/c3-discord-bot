import { injectable } from "inversify"
import { exec, spawn } from 'child_process'
import MusicMetadata from "../music/MusicMetadata"
import Logger from "../infrastructures/Logger"
import { Readable } from "stream"

@injectable()
class YouTubeService {
  private readonly musicMetadataCache: AutoCache<string, MusicMetadata> = new AutoCache()

  public constructor(private logger: Logger) {
    this.logger.setContextName(this.constructor.name)
  }

  public getAudioStream(url: string): Readable {
    const ytDlp = spawn("yt-dlp", [
      "-o", "-",
      "-f", "bestaudio",
      "--no-playlist",
      "-q", "--no-warnings",
      "--no-cache-dir",
      "--quiet",
      "--extract-audio",
      "--cookies", "youtube-cookies.txt",
      url
    ], { stdio: ['ignore', 'pipe', 'ignore'] })

    return ytDlp.stdout
  }

  public getMusicMetadata(url: string): Promise<MusicMetadata> {
    if (this.musicMetadataCache.has(url)) {
      return Promise.resolve(this.musicMetadataCache.get(url)!)
    }

    return new Promise<MusicMetadata>((resolve, reject) => {
      exec(`yt-dlp -j --no-warnings --flat-playlist --cookies youtube-cookies.txt "${url}"`, (error, stdout, stderr) => {
        if (error) {
          return reject(error)
        }

        if (stderr) {
          this.logger.error(stderr)

          reject(error)
        }

        try {
          const metadata = JSON.parse(stdout)

          const musicMetadata: MusicMetadata = {
            artist: metadata.artists ? (metadata.artists as string[])?.join(', ') : metadata.channel,
            duration: metadata.duration,
            title: metadata.title,
            image: new URL((metadata.thumbnails as any[])["artists" in metadata ? 3 : metadata.thumbnails.length - 1].url),
          }

          this.musicMetadataCache.set(url, musicMetadata)

          resolve(musicMetadata)
        } catch (error) {
          this.logger.error(`Failed to parse metadata: ${error}`, error as Error)

          return reject(error)
        }
      })
    })
  }

  public static getVideoIdFromUrl(url: string | URL): string | null {
    if (typeof url === 'string') {
      url = new URL(url)
    }

    switch (url.hostname) {
      case 'www.youtube.com':
      case 'youtube.com':
      case 'music.youtube.com':
        return url.searchParams.get('v') || null
      case 'youtu.be':
      case 'www.youtu.be':
        return url.pathname.slice(1)
      default:
        return null
    }
  }
}

export default YouTubeService