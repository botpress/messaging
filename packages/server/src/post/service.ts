import axios, { AxiosRequestConfig } from 'axios'
import { Service } from '../base/service'

import { ConfigService } from '../config/service'
import { Logger } from '../logger/types'

export class PostService extends Service {
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
      await axios.post(url, data, config)
    } catch (e) {
      // TODO: maybe we should retry if this call fails
      this.logger.error(e, `An error occurred calling route ${url}`)
    }
  }
}
