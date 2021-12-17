import { NextFunction, Request, Response } from 'express'

export const methodNotAllowed = (...allowedMethods: string[]) => {
  return (_req: Request, res: Response, _next: NextFunction) => {
    res.set('Allow', Object.keys(allowedMethods).join(', ').toUpperCase())
    res.status(405).send('Method Not Allowed')
  }
}
