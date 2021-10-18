import axios, { AxiosRequestConfig } from 'axios'
import clc from 'cli-color'
import { backOff } from 'exponential-backoff'

import { Service } from '../base/service'
import { Logger } from '../logger/types'

export class PostService extends Service {
  private readonly attempts = 10
  private isTerminating: boolean

  private logger: Logger
  private password: string | undefined

  constructor() {
    super()
    this.logger = new Logger('Post')
    this.isTerminating = false
  }

  public async setup() {
    this.password = process.env.INTERNAL_PASSWORD
  }

  async destroy() {
    this.isTerminating = true
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

          if (this.isTerminating) {
            return false
          }

          return true
        }
      })
    } catch (e) {
      this.logger.warn(
        `Unabled to reach webhook after ${this.attempts} attempts ${clc.blackBright(url)} ${clc.blackBright(
          `Error: ${(e as Error).message}`
        )}`
      )
    }
  }
}
