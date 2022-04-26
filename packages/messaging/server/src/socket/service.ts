import { uuid } from '@botpress/messaging-base'
import { CachingService, ServerCache, Service } from '@botpress/messaging-engine'
import { Socket } from 'socket.io'
import { UserService } from '../users/service'
import { SocketEmitter, SocketEvents, SocketWatcher } from './events'

export class SocketService extends Service {
  get events(): SocketWatcher {
    return this.emitter
  }

  private emitter: SocketEmitter
  private sockets: { [socketId: string]: SocketState | undefined } = {}
  private cache!: ServerCache<string, SocketState>

  private socketsByUserId: { [userId: string]: Socket[] | undefined } = {}
  private cacheByUserId!: ServerCache<uuid, Socket[]>

  constructor(private cachingService: CachingService, private userService: UserService) {
    super()
    this.emitter = new SocketEmitter()
  }

  async setup() {
    this.cache = await this.cachingService.newServerCache('cache_socket_states')
    this.cacheByUserId = await this.cachingService.newServerCache('cache_sockets_by_user_id')
  }

  public async create(socket: Socket, userId: uuid) {
    const current = this.socketsByUserId[userId]

    if (!current || !current.find((x) => x.id === socket.id)) {
      const state = {
        socket,
        userId
      }
      this.sockets[socket.id] = state
      this.cache.set(socket.id, state)

      const list = [...(current || []), socket]
      this.socketsByUserId[userId] = list
      this.cacheByUserId.set(userId, list)

      // this is the first socket connection this user has on this server
      if (list.length === 1) {
        await this.emitter.emit(SocketEvents.UserConnected, { userId: state.userId })
      }
    }
  }

  public async delete(socket: Socket) {
    const state = this.sockets[socket.id]

    if (state?.userId) {
      const current = this.socketsByUserId[state.userId]
      this.socketsByUserId[state.userId] = (current || []).filter((x) => x.id !== socket.id)
      this.cacheByUserId.del(state.userId)

      // this was the last socket connection the user had on this server
      if (current?.length === 1) {
        await this.emitter.emit(SocketEvents.UserDisconnected, { userId: state.userId })
      }
    }

    this.sockets[socket.id] = undefined
    this.cache.del(socket.id)
  }

  public getUserId(socket: Socket): uuid | undefined {
    // TODO: possible vulnerability here if the user gets deleted. It would still have permissions in the cache
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
  socket: Socket
  userId: uuid
}
