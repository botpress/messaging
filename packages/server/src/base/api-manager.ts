import { Router } from 'express'
import Joi from 'joi'
import { Auth } from './auth/auth'
import { Middleware } from './auth/base'
import { ClientApiRequest } from './auth/client'

export class ApiManager {
  constructor(private router: Router, private auth: Auth) {}

  post(path: string, schema: Joi.ObjectSchema<any>, fn: Middleware<ClientApiRequest>) {
    this.use('post', path, schema, fn)
  }

  get(path: string, schema: Joi.ObjectSchema<any>, fn: Middleware<ClientApiRequest>) {
    this.use('get', path, schema, fn)
  }

  delete(path: string, schema: Joi.ObjectSchema<any>, fn: Middleware<ClientApiRequest>) {
    this.use('delete', path, schema, fn)
  }

  use(type: 'post' | 'get' | 'delete', path: string, schema: Joi.ObjectSchema<any>, fn: Middleware<ClientApiRequest>) {
    this.router[type](
      path,
      this.auth.client.auth(async (req, res) => {
        const { error } = schema.validate({ query: req.query, body: req.body, params: req.params })
        if (error) {
          return res.status(400).send(error.message)
        }

        await fn(req, res, <any>undefined)
      })
    )
  }
}
