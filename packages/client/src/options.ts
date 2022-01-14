import { AxiosRequestConfig } from 'axios'
import { MessagingClientCredentials } from './auth'

export interface MessagingOptions {
  /** Base url of the messaging server */
  url: string
  /** Client credentials to access client owned resources */
  creds: MessagingClientCredentials
  /** A custom axios config giving more control over the HTTP client used internally. Optional */
  config?: Omit<AxiosRequestConfig, 'baseURL'>
}
