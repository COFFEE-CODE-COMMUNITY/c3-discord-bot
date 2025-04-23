import { PrismaClient, Prisma } from '@prisma/client'
import { injectable } from "inversify"
import Logger from "./Logger"

@injectable()
class Database extends PrismaClient {
  constructor(private logger: Logger) {
    super({
      log: [
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'query', emit: 'event' }
      ]
    })

    this.logger.setContextName(this.constructor.name)
    this.initEventLogging()
  }

  private initEventLogging(): void {
    // @ts-ignore
    this.$on('query', (e: Prisma.QueryEvent) => {
      this.logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`)
    })

    // @ts-ignore
    this.$on('info', (e: Prisma.LogEvent) => {
      this.logger.info(e.message)
    })

    // @ts-ignore
    this.$on('warn', (e: Prisma.LogEvent) => {
      this.logger.warn(e.message)
    })

    // @ts-ignore
    this.$on('error', (e: Prisma.LogEvent) => {
      this.logger.error(e.message)
    })
  }
}

export default Database