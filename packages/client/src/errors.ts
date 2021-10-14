export class BadRequestError extends Error {
  static statusCode = 400
}

export class UnauthorizedError extends Error {
  static statusCode = 401
}

export class ForbiddenError extends Error {
  static statusCode = 403
}

export class InternalServerError extends Error {
  static statusCode = 500
}
