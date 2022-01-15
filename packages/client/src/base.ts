import { uuid } from '@botpress/messaging-base'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { MessagingClientAuth } from './auth'
import { Emitter } from './emitter'
import { handleError } from './errors'
import { MessagingChannelOptions } from './options'

export abstract class MessagingChannelBase extends Emitter<{ user: any; started: any; message: any }> {
  protected readonly http: AxiosInstance
  protected auths: { [clientId: uuid]: MessagingClientAuth } = {}
  protected headers: { [clientId: uuid]: any } = {}

  constructor(options: MessagingChannelOptions) {
    super()

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

  private getAxiosConfig({ url, config }: MessagingChannelOptions): AxiosRequestConfig {
    const defaultConfig: AxiosRequestConfig = { baseURL: `${url}/api` }
    return { ...config, ...defaultConfig }
  }

  start(clientId: uuid, auth: MessagingClientAuth) {
    this.auths[clientId] = auth
    this.headers[clientId] = {
      'x-bp-messaging-client-id': clientId,
      'x-bp-messaging-client-token': auth.clientToken
    }
  }

  stop(clientId: uuid) {
    delete this.auths[clientId]
    delete this.headers[clientId]
  }
}
