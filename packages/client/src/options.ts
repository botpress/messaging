import { AxiosRequestConfig } from 'axios'
import { MessagingAuth } from './auth'

export interface MessagingOptions {
  /** Base url of the messaging server */
  url: string
  /** Client authentication to access client owned resources. Optional */
  auth?: MessagingAuth
  /** A custom axios config giving more control over the HTTP client used internally. Optional */
  config?: Omit<AxiosRequestConfig, 'baseURL'>
}
