import { Router } from 'express'
import { Auth } from '../base/auth/auth'
import { UserTokenService } from '../user-tokens/service'
import { UserService } from '../users/service'
import { CreateUserTokenSchema } from './schema'

export class UserTokenApi {
  constructor(
    private router: Router,
    private auth: Auth,
    private users: UserService,
    private userTokens: UserTokenService
  ) {}

  async setup() {
    // TODO: possibily useless route (will be done with sockets instead)
    this.router.post(
      '/user/tokens',
      this.auth.client.auth(async (req, res) => {
        const { error } = CreateUserTokenSchema.validate(req.body)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { userId } = req.body
        const user = await this.users.get(userId)

        if (!user) {
          return res.sendStatus(404)
        } else if (user.clientId !== req.client.id) {
          return res.sendStatus(403)
        }

        const rawToken = await this.userTokens.generateToken()
        const userToken = await this.userTokens.create(userId, rawToken)

        res.send({ token: `${userToken.id}.${rawToken}` })
      })
    )
  }
}
