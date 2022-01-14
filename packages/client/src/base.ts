import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { MessagingClientCredentials } from './auth'
import { handleError } from './errors'
import { MessagingOptions } from './options'

export const CLIENT_ID_HEADER = 'x-bp-messaging-client-id'
export const CLIENT_TOKEN_HEADER = 'x-bp-messaging-client-token'

export abstract class BaseClient {
  public get creds(): MessagingClientCredentials {
    return this._creds
  }

  protected readonly http: AxiosInstance
  protected readonly _creds: MessagingClientCredentials

  constructor(options: MessagingOptions) {
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

    this.http.defaults.headers.common[CLIENT_ID_HEADER] = options.creds.clientId
    this.http.defaults.headers.common[CLIENT_TOKEN_HEADER] = options.creds.clientToken
    this._creds = options.creds
  }

  private getAxiosConfig({ url, config }: MessagingOptions): AxiosRequestConfig {
    const defaultConfig: AxiosRequestConfig = { baseURL: `${url}/api` }

    return { ...config, ...defaultConfig }
  }
}
