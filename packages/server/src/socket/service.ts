import { uuid } from '@botpress/messaging-base'
import { Socket } from 'socket.io'
import { Service } from '../base/service'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { UserService } from '../users/service'

export class SocketService extends Service {
  private sockets: { [socketId: string]: SocketState | undefined } = {}
  private cache!: ServerCache<string, SocketState>

  private socketsByUserId: { [userId: string]: Socket[] | undefined } = {}
  private cacheByUserId!: ServerCache<uuid, Socket[]>

  constructor(private cachingService: CachingService, private userService: UserService) {
    super()
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache('cache_socket_states')
    this.cacheByUserId = await this.cachingService.newServerCache('cache_sockets_by_user_id')
  }

  public create(socket: Socket) {
    this.sockets[socket.id] = {}
  }

  public delete(socket: Socket) {
    const state = this.sockets[socket.id]!

    if (state.userId) {
      const current = this.socketsByUserId[state.userId]
      this.socketsByUserId[state.userId] = (current || []).filter((x) => x.id !== socket.id)
      this.cacheByUserId.del(state.userId)
    }

    this.sockets[socket.id] = undefined
    this.cache.del(socket.id)
  }

  public getUserId(socket: Socket): uuid | undefined {
    // Todo: possible vulnerability here if the user gets deleted. It would still have permissions in the cache
    // The user service has no delete() function at the moment so we can't listen to deleted events yet

    const cached = this.cache.get(socket.id)
    if (cached) {
      return cached.userId
    }

    const state = this.sockets[socket.id]

    if (state?.userId) {
      this.cache.set(socket.id, state)
      return state.userId
    } else {
      return undefined
    }
  }

  public registerForUser(socket: Socket, userId: uuid) {
    const state = {
      socket,
      userId
    }
    this.sockets[socket.id] = state
    this.cache.del(socket.id)

    const current = this.socketsByUserId[userId]
    this.socketsByUserId[userId] = [...(current || []), socket]
    this.cacheByUserId.del(userId)
  }

  public listByUser(userId: string) {
    const cached = this.cacheByUserId.get(userId)
    if (cached) {
      return cached
    }

    const sockets = this.socketsByUserId[userId] || []
    this.cacheByUserId.set(userId, sockets)
    return sockets
  }
}

export interface SocketState {
  userId?: uuid
}
