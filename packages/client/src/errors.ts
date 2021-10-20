import axios from 'axios'

export class BadRequestError extends Error {
  static statusCode = 400
}

export class UnauthorizedError extends Error {
  static statusCode = 401
}

export class ForbiddenError extends Error {
  static statusCode = 403
}

export class NotFoundError extends Error {
  static statusCode = 404
}

export class InternalServerError extends Error {
  static statusCode = 500
}

export const handleError = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    switch (err.response?.status) {
      case 400:
        throw new BadRequestError(err.message)
      case 401:
        throw new UnauthorizedError(err.message)
      case 403:
        throw new ForbiddenError(err.message)
      case 404:
        throw new NotFoundError(err.message)
      case 500:
        throw new InternalServerError(err.message)
      default:
        throw err
    }
  }

  throw err
}

export const handleNotFound = async <U, T, F extends Function = () => U>(func: F, returnValue: T): Promise<U | T> => {
  try {
    return await func()
  } catch (err) {
    if (err instanceof NotFoundError) {
      return returnValue
    } else {
      throw err
    }
  }
}
