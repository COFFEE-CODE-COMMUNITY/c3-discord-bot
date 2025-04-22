import Logger from "../infrastructures/Logger"
import container from "../infrastructures/container"
import { Readable } from "stream"
import MusicMetadata from "./MusicMetadata"

abstract class MusicStreamProvider {
  protected readonly logger: Logger = container.get(Logger)

  protected readonly musicMetadata!: MusicMetadata

  public abstract getAudioStream(): Readable
  public abstract getMusicMetadata(): MusicMetadata
}

export default MusicStreamProvider