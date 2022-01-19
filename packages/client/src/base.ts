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
  public get options() {
    return this._options
  }
  public set options(val: MessagingChannelOptions) {
    this._options = val
    this.applyOptions()
  }

  public get url() {
    return this._options.url
  }
  public set url(val: string) {
    this._options.url = val
    this.applyOptions()
  }

  public get adminKey() {
    return this._options.adminKey
  }
  public set adminKey(val: string | undefined) {
    this._options.adminKey = val
    this.applyOptions()
  }

  public get axios() {
    return this._options.axios
  }
  public set axios(val: Omit<AxiosRequestConfig, 'baseURL'> | undefined) {
    this._options.axios = val
    this.applyOptions()
  }

  protected _options: MessagingChannelOptions

  protected http!: AxiosInstance
  protected auths: { [clientId: uuid]: MessagingClientAuth } = {}
  protected headers: { [clientId: uuid]: any } = {}
  protected adminHeader: any

  constructor(options: MessagingChannelOptions) {
    super()
    this._options = options
    this.applyOptions()
  }

  private applyOptions() {
    const config = this.getAxiosConfig(this._options)
    this.http = axios.create(config)
    this.adminHeader = this._options.adminKey?.length ? { 'x-bp-messaging-admin-key': this._options.adminKey } : {}
  }

  private getAxiosConfig({ url, axios }: MessagingChannelOptions): AxiosRequestConfig {
    const defaultConfig: AxiosRequestConfig = { baseURL: `${url}/api` }
    return { ...axios, ...defaultConfig }
  }

  has(clientId: uuid) {
    return this.auths[clientId] !== undefined
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
