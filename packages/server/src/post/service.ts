import axios, { AxiosRequestConfig } from 'axios'
import { Service } from '../base/service'
import { ConfigService } from '../config/service'
import { Logger } from '../logger/types'

export class PostService extends Service {
  private password!: string
  private logger: Logger

  constructor(private configService: ConfigService) {
    super()
    this.logger = new Logger('Post')
  }

  async setup() {
    this.password = process.env.INTERNAL_PASSWORD || this.configService.current.security?.password
  }

  async post(url: string, data: any, token?: string) {}

  private async callWebhook(url: string, data: any, token?: string) {
    const config: AxiosRequestConfig = { headers: {} }

    if (this.password) {
      config.headers.password = this.password
    }

    if (token) {
      config.headers['x-webhook-token'] = token
    }

    try {
      await axios.post(url, data, config)
    } catch (e) {
      // TODO: remove this logging
      this.logger.error(`Failed to call webhook ${url}.`, e.message)
    }
  }
}
