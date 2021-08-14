import { uuid } from '@botpress/messaging-base'
import _ from 'lodash'
import { Socket } from 'socket.io'
import { Service } from '../base/service'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'

export class SocketService extends Service {
  private sockets: { [socketId: string]: SocketState | undefined } = {}

  private socketsByUserId: { [userId: string]: Socket[] } = {}
  private cacheByUserId!: ServerCache<uuid, Socket[]>

  constructor(private cachingService: CachingService) {
    super()
  }

  async setup() {
    this.cacheByUserId = await this.cachingService.newServerCache('cache_sockets_by_user_id')
  }

  public create(socket: Socket) {
    this.sockets[socket.id] = { userLinks: [] }
  }

  public delete(socket: Socket) {
    const state = this.sockets[socket.id]!

    for (const userId of state.userLinks) {
      _.remove(this.socketsByUserId[userId], (x) => x.id === socket.id)
      this.cacheByUserId.del(userId)
    }

    this.sockets[socket.id] = undefined
  }

  public registerForUser(userId: uuid, socket: Socket) {
    const state = this.sockets[socket.id]!
    state.userLinks.push(userId)

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
  userLinks: uuid[]
}
