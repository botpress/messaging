import { Router } from 'express'
import { Auth } from '../base/auth/auth'
import { GetUserSchema } from './schema'
import { UserService } from './service'

export class UserApi {
  constructor(private router: Router, private auth: Auth, private users: UserService) {}

  setup() {
    this.router.post(
      '/users',
      this.auth.client.auth(async (req, res) => {
        const user = await this.users.create(req.client!.id)

        res.send(user)
      })
    )

    this.router.get(
      '/users/:id',
      this.auth.client.auth(async (req, res) => {
        const { error } = GetUserSchema.validate(req.params)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { id } = req.params
        const user = await this.users.get(id)

        if (user && user.clientId !== req.client!.id) {
          return res.sendStatus(403)
        } else if (!user) {
          return res.sendStatus(404)
        }

        res.send(user)
      })
    )
  }
}
