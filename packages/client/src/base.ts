import { uuid } from '@botpress/messaging-base'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import cookie from 'cookie'
import { ConversationStartedEvent, MessageFeedbackEvent, MessageNewEvent, UserCreatedEvent, UserFetchedEvent } from '.'
import { MessagingClientAuth } from './auth'
import { Emitter } from './emitter'
import { Logger } from './logger'
import { MessagingChannelOptions } from './options'

export abstract class MessagingChannelBase extends Emitter<{
  user_created: UserCreatedEvent
  user_fetched: UserFetchedEvent
  /** @deprecated */
  user: UserCreatedEvent
  started: ConversationStartedEvent
  message: MessageNewEvent
  feedback: MessageFeedbackEvent
}> {
  /** Options that are currently applied */
  public get options() {
    return this._options
  }
  public set options(val: MessagingChannelOptions) {
    this._options = val
    this.applyOptions()
  }

  /** Base url of the messaging server */
  public get url() {
    return this._options.url
  }
  public set url(val: string) {
    this._options.url = val
    this.applyOptions()
  }

  /** Key to access admin routes. Optional */
  public get adminKey() {
    return this._options.adminKey
  }
  public set adminKey(val: string | undefined) {
    this._options.adminKey = val
    this.applyOptions()
  }

  /** A custom axios config giving more control over the HTTP client used internally. Optional */
  public get axios() {
    return this._options.axios
  }
  public set axios(val: Omit<AxiosRequestConfig, 'baseURL'> | undefined) {
    this._options.axios = val
    this.applyOptions()
  }

  /** Logger interface that can be used to get better debugging. Optional */
  public get logger() {
    return this._options.logger
  }
  public set logger(val: Logger | undefined) {
    this._options.logger = val
    this.applyOptions()
  }

  /** Name of the cookie for sticky sessions */
  public get sessionCookieName() {
    return this._options.sessionCookieName
  }
  public set sessionCookieName(val: string | undefined) {
    this._options.sessionCookieName = val
    this.applyOptions()
  }

  protected _options: MessagingChannelOptions

  protected http!: AxiosInstance
  protected auths: { [clientId: uuid]: MessagingClientAuth | undefined } = {}
  protected headers: { [clientId: uuid]: any } = {}
  protected adminHeader: any

  constructor(options: MessagingChannelOptions) {
    super()
    this._options = options
    this.applyOptions()
  }

  private applyOptions() {
    const config = this.getAxiosConfig(this._options)
    this.adminHeader = this._options.adminKey?.length ? { 'x-bp-messaging-admin-key': this._options.adminKey } : {}

    this.http = axios.create(config)
    this.http.interceptors.response.use(
      (e) => {
        this.saveCookie(e.headers['set-cookie'])
        return e
      },
      (e) => {
        this.saveCookie(e?.response?.headers?.['set-cookie'])
        return Promise.reject(e)
      }
    )
  }

  private saveCookie(cookieHeader: string[] | undefined) {
    if (!this.sessionCookieName || !cookieHeader) {
      return
    }

    for (const strCookie of cookieHeader) {
      const resCookie = cookie.parse(strCookie)
      if (resCookie[this.sessionCookieName]) {
        this.http.defaults.headers.common['cookie'] = `${this.sessionCookieName}=${resCookie[this.sessionCookieName]};`
      }
    }
  }

  private getAxiosConfig({ url, axios }: MessagingChannelOptions): AxiosRequestConfig {
    const defaultConfig: AxiosRequestConfig = { baseURL: `${url}/api/v1` }
    return { ...axios, ...defaultConfig }
  }

  /**
   * Indicates if credentials for a specific client id are currently known (start was called)
   */
  has(clientId: uuid) {
    return this.auths[clientId] !== undefined
  }

  /**
   * Configures credentials of a client to allow making requests using that client id
   * Credentials are stored in memory
   */
  start(clientId: uuid, auth: MessagingClientAuth) {
    this.auths[clientId] = auth
    this.headers[clientId] = {
      'x-bp-messaging-client-id': clientId,
      'x-bp-messaging-client-token': auth.clientToken
    }
  }

  /**
   * Removed credentials of a client id. It's not possible to make request to this
   * client id after stop was called (start needs to be called again)
   */
  stop(clientId: uuid) {
    delete this.auths[clientId]
    delete this.headers[clientId]
  }
}
