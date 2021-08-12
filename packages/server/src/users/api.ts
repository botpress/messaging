import clc from 'cli-color'
import { Router } from 'express'
import { Server } from 'http'
import Socket from 'socket.io'
import { ApiRequest, ClientScopedApi } from '../base/api'
import { ClientService } from '../clients/service'
import { Logger } from '../logger/types'
import { UserService } from './service'

export class UserApi extends ClientScopedApi {
  constructor(router: Router, clients: ClientService, private users: UserService) {
    super(router, clients)
  }

  async setup() {
    this.router.use('/users', this.extractClient.bind(this))

    this.router.post(
      '/users',
      this.asyncMiddleware(async (req: ApiRequest, res) => {
        const user = await this.users.create(req.client!.id)

        res.send(user)
      })
    )
  }

  async setupSocket(server: Server) {
    const logger = new Logger('Socket')

    const ws = new Socket.Server(server, { path: '/api/users/socket', cors: { origin: '*' } })
    ws.on('connection', (socket) => {
      socket.on('message', (data) => {
        logger.debug(`${clc.blackBright(`[${socket.id}]`)} ${clc.magenta('message')}`, data)
      })
      socket.on('disconnect', (data) => {
        logger.debug(`${clc.blackBright(`[${socket.id}]`)} ${clc.bgBlack(clc.magenta('disconnect'))}`)
      })
      logger.debug(`${clc.blackBright(`[${socket.id}]`)} ${clc.bgBlue(clc.magentaBright('connection'))}`)
    })
  }
}
