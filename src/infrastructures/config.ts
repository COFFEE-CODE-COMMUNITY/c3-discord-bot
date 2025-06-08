import convict from 'convict'
import dotenv from "dotenv"

dotenv.config()

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  bot: {
    token: {
      doc: 'Discord bot token.',
      format: String,
      default: '',
      env: 'DISCORD_BOT_TOKEN',
      sensitive: true
    },
    clientId: {
      doc: 'Discord bot client ID.',
      format: String,
      default: '',
      env: 'DISCORD_BOT_CLIENT_ID'
    }
  },
  c3: {
    channels: {
      gate: {
        id: {
          doc: 'Channel ID for gate.',
          format: String,
          default: '',
          env: 'C3_CHANNEL_GATE_ID'
        }
      },
      feedback: {
        id: {
          doc: 'Channel ID for feedback.',
          format: String,
          default: '',
          env: 'C3_CHANNEL_FEEDBACK_ID'
        }
      },
      log: {
        feedback: {
          id: {
            doc: 'Channel ID for feedback logs.',
            format: String,
            default: '',
            env: 'C3_CHANNEL_LOG_FEEDBACK_ID'
          }
        }
      }
    },
    guild: {
      id: {
        doc: 'Guild ID for C3 discord server.',
        format: String,
        default: '',
        env: 'C3_GUILD_ID'
      }
    }
  },
  spotify: {
    clientId: {
      doc: 'Spotify client ID.',
      format: String,
      default: '',
      env: 'SPOTIFY_CLIENT_ID',
      sensitive: true
    },
    clientSecret: {
      doc: 'Spotify client secret.',
      format: String,
      default: '',
      env: 'SPOTIFY_CLIENT_SECRET',
      sensitive: true
    }
  }
})

config.validate({ allowed: 'strict' })

export default config