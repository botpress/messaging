import axios, { AxiosRequestConfig } from 'axios'

import { ConfigService } from '../config/service'
import { Logger } from '../logger/types'

export class PostService {
  private logger: Logger

  constructor(private configService: ConfigService) {
    this.logger = new Logger('post')
  }

  public async send(url: string, data?: any, headers?: { [name: string]: string }) {
    const password = process.env.INTERNAL_PASSWORD || this.configService.current.security?.password
    const config: AxiosRequestConfig = { headers: {} }

    if (headers) {
      config.headers = headers
    }

    if (password) {
      config.headers.password = password
    }

    try {
      await axios.post(url, data, config)
    } catch (e) {
      // TODO: maybe we should retry if this call fails
      this.logger.error(e, `An error occurred calling route ${url}`)
    }
  }
}
