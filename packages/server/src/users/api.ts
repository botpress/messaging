import { uuid } from '@botpress/messaging-base'
import { Router } from 'express'
import { Auth } from '../base/auth/auth'
import { ClientService } from '../clients/service'
import { SocketManager } from '../socket/manager'
import { SocketService } from '../socket/service'
import { UserTokenService } from '../user-tokens/service'
import { AuthUserSocketSchema, GetUserSchema } from './schema'
import { UserService } from './service'

export class UserApi {
  constructor(
    private router: Router,
    private auth: Auth,
    private clients: ClientService,
    private sockets: SocketManager,
    private users: UserService,
    private userTokens: UserTokenService,
    private socketService: SocketService
  ) {}

  async setup() {
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

    this.sockets.handle('users.auth', async (socket, message) => {
      const { error } = AuthUserSocketSchema.validate(message.data)
      if (error) {
        return this.sockets.reply(socket, message, { error: true, message: error.message })
      }

      const { clientId, id: userId, token: userTokenRaw }: { clientId: uuid; id: uuid; token: string } = message.data

      const client = await this.clients.getById(clientId)
      if (!client) {
        return this.sockets.reply(socket, message, { error: true, message: 'client not found' })
      }

      // TODO: refactor here

      let success = true
      let user = userId ? await this.users.get(userId) : undefined
      let token = undefined

      if (!user || user.clientId !== client.id) {
        success = false
      } else {
        const [userTokenId, userTokenToken] = userTokenRaw.split('.')
        const userToken = await this.userTokens.getByIdAndToken(userTokenId, userTokenToken)
        if (!userToken) {
          success = false
        }
      }

      if (!success) {
        user = await this.users.create(clientId)
        const tokenRaw = await this.userTokens.generateToken()
        const userToken = await this.userTokens.create(user.id, tokenRaw, undefined)
        token = `${userToken.id}.${tokenRaw}`
      }

      this.socketService.registerForUser(socket, user!.id)
      this.sockets.reply(socket, message, { id: user!.id, token })
    })
  }
}
