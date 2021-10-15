import { uuid } from '@botpress/messaging-base'
import { Router } from 'express'
import { Auth } from '../base/auth/auth'
import { ClientService } from '../clients/service'
import { SocketManager } from '../socket/manager'
import { SocketService } from '../socket/service'
import { AuthUserSocketSchema, GetUserSchema } from './schema'
import { UserService } from './service'

export class UserApi {
  constructor(
    private router: Router,
    private auth: Auth,
    private clients: ClientService,
    private sockets: SocketManager,
    private users: UserService,
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

      const { clientId, userId, userToken }: { clientId: uuid; userId: uuid; userToken: string } = message.data

      const client = await this.clients.getById(clientId)
      if (!client) {
        return this.sockets.reply(socket, message, { error: true, message: 'client not found' })
      }

      // TODO: use user token to validate user
      let user = userId && (await this.users.get(userId))
      if (!user || user.clientId !== client.id) {
        user = await this.users.create(client.id)
      }

      this.socketService.registerForUser(socket, user.id)
      this.sockets.reply(socket, message, user)
    })
  }
}
