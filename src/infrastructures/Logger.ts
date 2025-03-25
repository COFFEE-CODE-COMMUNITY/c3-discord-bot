import { injectable } from "inversify"
import { Logger as WinstonLogger, transports, format } from "winston";

@injectable()
export default class Logger {
  private logger: WinstonLogger

  private readonly LOGGER_LEVER = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    command: 4,
    verbose: 5,
    debug: 6,
    silly: 7
  }

  public constructor() {
    this.logger = new WinstonLogger({
      levels: this.LOGGER_LEVER,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
      transports: [
        new transports.Console({
          format: format.combine(
            format.timestamp(),
            format.printf(({ level, message, timestamp, context }) =>
              `[${level.toUpperCase()}] [${context ?? 'Application'}] ${timestamp} - ${message}`
            )
          )
        }),
        // (config.get('app.nodeEnv') === Environment.PRODUCTION) && new transports.File({
        //   filename: 'application.log',
        //   format: format.json()
        // })
      ]
    })
  }

  public silly(message: any): void {
    this.logger.log('silly', message)
  }

  public debug(message: any): void {
    this.logger.log('debug', message)
  }

  public verbose(message: any): void {
    this.logger.log('verbose', message)
  }

  public http(message: any): void {
    this.logger.log('http', message)
  }

  public log(message: any): any {
    this.logger.log('info', message)
  }

  public info(message: any): void {
    this.logger.log('info', message)
  }

  public warn(message: any): void {
    this.logger.log('warn', message)
  }

  public error(message: any): void {
    this.logger.log('error', message)
  }

  public fatal(message: any): void {
    this.logger.log('fatal', message)
  }

  public setContextName(name: string): void {
    this.logger = this.logger.child({ context: name })
  }
}