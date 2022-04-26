import { Client as StanClient } from '@botpress/nlu-client'
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import qs from 'querystring'
import { cache } from './cache'

interface OauthTokenClientProps {
  clientId: string
  clientSecret: string
}

type OauthClientProps = OauthTokenClientProps & {
  baseURL: string
}

interface OauthResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
}

type ErrorRetrier = AxiosError & { config: { _retry: boolean } }

export class CloudClient extends StanClient {
  constructor(options: OauthClientProps) {
    super({ baseURL: options.baseURL, validateStatus: () => true })

    const { clientId, clientSecret } = options
    const oauthTokenClient = this._createOauthTokenClient(axios.create(), {
      clientId,
      clientSecret
    })

    const tokenCache = cache(oauthTokenClient, {
      getExpiryInMs: (res) => res.expires_in * 1000,
      getToken: (res) => res.access_token
    })

    this.axios.interceptors.request.use(this._requestInterceptor(tokenCache).bind(this) as any)
    this.axios.interceptors.response.use(undefined, this._errorInterceptor(this.axios as any, tokenCache).bind(this))

    this.modelWeights.axios.interceptors.request.use(this._requestInterceptor(tokenCache).bind(this) as any)
    this.modelWeights.axios.interceptors.response.use(
      undefined,
      this._errorInterceptor(this.axios as any, tokenCache).bind(this)
    )
  }

  private _createOauthTokenClient =
    (axios: AxiosInstance, oauthTokenClientProps: OauthTokenClientProps) => async () => {
      const { clientId, clientSecret } = oauthTokenClientProps
      const res = await axios.post(
        process.CLOUD_OAUTH_ENDPOINT,
        qs.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
          scope: 'nlu'
        })
      )

      return res.data as OauthResponse
    }

  private _requestInterceptor =
    (authenticate: () => Promise<string>) =>
    async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
      const token = await authenticate()

      if (!config.headers) {
        config.headers = {}
      }

      config.headers.Authorization = `Bearer ${token}`
      return config
    }

  private _errorInterceptor =
    (instance: AxiosInstance, authenticate: () => Promise<string>) => async (error: ErrorRetrier) => {
      if (error.response?.status === 401 && !error.config._retry) {
        error.config._retry = true
        const token = await authenticate()
        const config = error.config

        if (!config.headers) {
          config.headers = {}
        }

        config.headers.Authorization = `Bearer ${token}`
        return instance.request(config)
      }

      return Promise.reject(error)
    }
}
