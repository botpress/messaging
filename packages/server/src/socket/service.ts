import { uuid } from '@botpress/messaging-base'
import _ from 'lodash'
import { Socket } from 'socket.io'
import { Service } from '../base/service'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { UserService } from '../users/service'

export class SocketService extends Service {
  private sockets: { [socketId: string]: SocketState | undefined } = {}

  private socketsByUserId: { [userId: string]: Socket[] } = {}
  private cacheByUserId!: ServerCache<uuid, Socket[]>

  constructor(private cachingService: CachingService, private userService: UserService) {
    super()
  }

  async setup() {
    this.cacheByUserId = await this.cachingService.newServerCache('cache_sockets_by_user_id')
  }

  public create(socket: Socket) {
    this.sockets[socket.id] = {}
  }

  public delete(socket: Socket) {
    const state = this.sockets[socket.id]!

    if (state.userId && this.socketsByUserId[state.userId]) {
      _.remove(this.socketsByUserId[state.userId], (x) => x.id === socket.id)
      this.cacheByUserId.del(state.userId)
    }

    this.sockets[socket.id] = undefined
  }

  public getUserInfo(socket: Socket) {
    const state = this.sockets[socket.id]
    return {
      clientId: state!.clientId!,
      userId: state!.userId!
    }
  }

  public async registerForUser(socket: Socket, userId: uuid) {
    const user = await this.userService.get(userId)

    const state = this.sockets[socket.id]!
    state.userId = userId
    state.clientId = user!.clientId

    if (!this.socketsByUserId[userId]) {
      this.socketsByUserId[userId] = []
    }
    this.socketsByUserId[userId].push(socket)
  }

  public listByUser(userId: string) {
    const cached = this.cacheByUserId.get(userId)
    if (cached) {
      return cached
    }

    const sockets = this.socketsByUserId[userId]
    this.cacheByUserId.set(userId, sockets)
    return sockets
  }
}

export interface SocketState {
  clientId?: uuid
  userId?: uuid
}
