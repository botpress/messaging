import axios, { AxiosRequestConfig } from 'axios'
import { backOff } from 'exponential-backoff'

import { Service } from '../base/service'
import { ConfigService } from '../config/service'
import { Logger } from '../logger/types'

export class PostService extends Service {
  private readonly attempts = 10

  private logger: Logger
  private password: string | undefined

  constructor(private configService: ConfigService) {
    super()
    this.logger = new Logger('post')
  }

  public async setup() {
    this.password = process.env.INTERNAL_PASSWORD || this.configService.current.security?.password
  }

  public async send(url: string, data?: any, headers?: { [name: string]: string }) {
    const config: AxiosRequestConfig = { headers: {} }

    if (headers) {
      config.headers = headers
    }

    if (this.password) {
      config.headers.password = this.password
    }

    try {
      await backOff(async () => axios.post(url, data, config), {
        jitter: 'none', // TODO: We should enable to jitter if the post service may be called for the same resource on multiple nodes
        numOfAttempts: this.attempts,
        retry: (_e: any, _attemptNumber: number) => {
          // TODO: Add debug logging
          //this.logger.debug(`attempt number: ${attemptNumber}`)

          return true
        }
      })
    } catch (e) {
      this.logger.error(e, `An error occurred calling route ${url}. Total number of attempts: ${this.attempts}`)
    }
  }
}
