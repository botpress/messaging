import { uuid } from '@botpress/messaging-base'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { ConversationStartedEvent, MessageNewEvent, UserNewEvent } from '.'
import { MessagingClientAuth } from './auth'
import { Emitter } from './emitter'
import { MessagingChannelOptions } from './options'

export abstract class MessagingChannelBase extends Emitter<{
  user: UserNewEvent
  started: ConversationStartedEvent
  message: MessageNewEvent
}> {
  protected readonly http: AxiosInstance
  protected auths: { [clientId: uuid]: MessagingClientAuth } = {}
  protected headers: { [clientId: uuid]: any } = {}
  protected adminHeader: any

  constructor(options: MessagingChannelOptions) {
    super()

    const config = this.getAxiosConfig(options)
    this.http = axios.create(config)
    this.adminHeader = options.adminKey?.length ? { 'x-bp-messaging-admin-key': options.adminKey } : {}
  }

  private getAxiosConfig({ url, axios }: MessagingChannelOptions): AxiosRequestConfig {
    const defaultConfig: AxiosRequestConfig = { baseURL: `${url}/api` }
    return { ...axios, ...defaultConfig }
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
