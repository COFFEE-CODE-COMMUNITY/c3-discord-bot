import {
  AudioPlayer,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  createAudioPlayer,
  VoiceConnection,
  VoiceConnectionState,
  VoiceConnectionStatus, AudioPlayerState, AudioPlayerStatus
} from "@discordjs/voice"
import config from "../infrastructures/config"
import Logger from "../infrastructures/Logger"
import container from "../infrastructures/container"

export interface VoicePlayerConfiguration {
  channelId: string
  guildId: string
  adapterCreator: DiscordGatewayAdapterCreator
}

export type VoiceConnectionNewState = VoiceConnectionState & {
  status: VoiceConnectionStatus
}

export type AudioPlayerNewState = AudioPlayerState & {
  status: AudioPlayerStatus
}

abstract class VoicePlayer {
  protected readonly logger: Logger = container.get(Logger)
  protected readonly connection: VoiceConnection
  protected readonly audio: AudioPlayer

  protected constructor(configuration: VoicePlayerConfiguration) {
    this.logger.setContextName(this.constructor.name)

    this.connection = this.createConnection(configuration)
    this.setupConnectionEvents()

    this.audio = this.createAudio()
    this.setupAudioEvents()
  }

  protected createConnection(configuration: VoicePlayerConfiguration): VoiceConnection {
    return joinVoiceChannel({
      channelId: configuration.channelId,
      guildId: configuration.guildId,
      adapterCreator: configuration.adapterCreator,
      debug: config.get('env') !== 'production',
    })
  }

  private setupConnectionEvents(): void {
    this.connection.on('debug', this.onConnectionDebug.bind(this))
    this.connection.on('error', this.onConnectionError.bind(this))
    this.connection.on('stateChange', this.onConnectionStateChange.bind(this))
    this.connection.on(VoiceConnectionStatus.Signalling, this.onConnectionSignalling.bind(this))
    this.connection.on(VoiceConnectionStatus.Connecting, this.onConnectionConnecting.bind(this))
    this.connection.on(VoiceConnectionStatus.Ready, this.onConnectionReady.bind(this))
    this.connection.on(VoiceConnectionStatus.Disconnected, this.onConnectionDisconnected.bind(this))
    this.connection.on(VoiceConnectionStatus.Destroyed, this.onConnectionDestroyed.bind(this))
  }

  protected onConnectionDebug(message: string): void {
    this.logger.debug(message)
  }

  protected onConnectionError(error: Error): void {
    this.logger.error(error.message, error)
  }

  protected onConnectionStateChange(oldState: VoiceConnectionState, newState: VoiceConnectionState): void {
    this.logger.debug(`Connection state changed from ${oldState.status} to ${newState.status}`)
  }

  protected onConnectionSignalling(oldState: VoiceConnectionState, newState: VoiceConnectionNewState): void {
    this.logger.debug(`Requesting permission to join ${this.connection.joinConfig.channelId} channel on ${this.connection.joinConfig.guildId} guild`)
  }

  protected onConnectionConnecting(oldState: VoiceConnectionState, newState: VoiceConnectionNewState): void {
    this.logger.debug(`Connecting to ${this.connection.joinConfig.channelId} channel on ${this.connection.joinConfig.guildId} guild`)
  }

  protected onConnectionReady(oldState: VoiceConnectionState, newState: VoiceConnectionNewState): void {
    this.logger.debug(`Connection on ${this.connection.joinConfig.channelId} channel on ${this.connection.joinConfig.guildId} guild is ready`)
  }

  protected onConnectionDisconnected(oldState: VoiceConnectionState, newState: VoiceConnectionNewState): void {
    this.logger.debug(`Disconnected from ${this.connection.joinConfig.channelId} channel on ${this.connection.joinConfig.guildId} guild`)
  }

  protected onConnectionDestroyed(oldState: VoiceConnectionState, newState: VoiceConnectionNewState): void {
    this.logger.debug(`Destroying connection from ${this.connection.joinConfig.channelId} channel on ${this.connection.joinConfig.guildId} guild`)
  }

  protected createAudio(): AudioPlayer {
    const audioPlayer = createAudioPlayer({
      debug: config.get('env') !== 'production'
    })

    this.connection.subscribe(audioPlayer)

    return audioPlayer
  }

  private setupAudioEvents(): void {
    this.audio.on('debug', this.onAudioDebug.bind(this))
    this.audio.on('error', this.onAudioError.bind(this))
    this.audio.on('stateChange', this.onAudioStateChange.bind(this))
    this.audio.on(AudioPlayerStatus.Idle, this.onAudioIdle.bind(this))
    this.audio.on(AudioPlayerStatus.Buffering, this.onAudioBuffering.bind(this))
    this.audio.on(AudioPlayerStatus.Playing, this.onAudioPlaying.bind(this))
    this.audio.on(AudioPlayerStatus.AutoPaused, this.onAudioAutoPaused.bind(this))
    this.audio.on(AudioPlayerStatus.Paused, this.onAudioPaused.bind(this))
  }

  protected onAudioDebug(message: string): void {
    this.logger.debug(message)
  }

  protected onAudioError(error: Error): void {
    this.logger.error(error.message, error)
  }

  protected onAudioStateChange(oldState: AudioPlayerState, newState: AudioPlayerNewState): void {
    this.logger.debug(`Audio player state changed from ${oldState.status} to ${newState.status}`)
  }

  protected onAudioIdle(oldState: AudioPlayerState, newState: AudioPlayerNewState): void {
    this.logger.debug(`Audio player is idle`)
  }

  protected onAudioBuffering(oldState: AudioPlayerState, newState: AudioPlayerNewState): void {
    this.logger.debug(`Audio player is buffering`)
  }

  protected onAudioPlaying(oldState: AudioPlayerState, newState: AudioPlayerNewState): void {
    this.logger.debug(`Audio player is playing`)
  }

  protected onAudioAutoPaused(oldState: AudioPlayerState, newState: AudioPlayerNewState): void {
    this.logger.debug(`Audio player is auto paused`)
  }

  protected onAudioPaused(oldState: AudioPlayerState, newState: AudioPlayerNewState): void {
    this.logger.debug(`Audio player is paused`)
  }

  public disconnect(): void {
    if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
      this.connection.destroy();

      this.logger.debug(`Disconnected and destroyed the connection for channel ${this.connection.joinConfig.channelId} in guild ${this.connection.joinConfig.guildId}`);
    } else {
      this.logger.warn(`Attempted to disconnect an already destroyed connection for channel ${this.connection.joinConfig.channelId} in guild ${this.connection.joinConfig.guildId}`);
    }
  }
}

export default VoicePlayer