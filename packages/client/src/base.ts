import axios, { AxiosInstance } from 'axios'
import { BadRequestError, UnauthorizedError, ForbiddenError, InternalServerError } from './errors'

const handleError = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    switch (err.response?.status) {
      case 400:
        throw new BadRequestError(err.message)
      case 401:
        throw new UnauthorizedError(err.message)
      case 403:
        throw new ForbiddenError(err.message)
      case 404:
        return undefined
      case 500:
        throw new InternalServerError(err.message)
      default:
        throw err
    }
  }

  throw err
}

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
