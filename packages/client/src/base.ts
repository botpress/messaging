import { AxiosInstance } from 'axios'
import { handleError } from './errors'

export abstract class BaseClient {
  constructor(protected http: AxiosInstance) {
    http.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        return handleError(error)
      }
    )
  }
}
