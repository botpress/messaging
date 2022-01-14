import { SyncResult, SyncRequest } from '@botpress/messaging-base'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { handleError } from './errors'

export class MessagingAdminClient {
  protected readonly http: AxiosInstance

  constructor(options: MessagingAdminOptions) {
    const config = this.getAxiosConfig(options)
    this.http = axios.create(config)
    this.http.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        return handleError(error)
      }
    )
  }

  async sync(config: SyncRequest): Promise<SyncResult> {
    return (await this.http.post('/sync', config)).data
  }

  private getAxiosConfig({ url, config }: MessagingAdminOptions): AxiosRequestConfig {
    const defaultConfig: AxiosRequestConfig = { baseURL: `${url}/api` }

    return { ...config, ...defaultConfig }
  }
}

export interface MessagingAdminOptions {
  /** Base url of the messaging server */
  url: string
  /** A custom axios config giving more control over the HTTP client used internally. Optional */
  config?: Omit<AxiosRequestConfig, 'baseURL'>
}
