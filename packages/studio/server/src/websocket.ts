import { EventEmitter2 } from 'eventemitter2'
import { Server } from 'http'

import _ from 'lodash'
import Socket from 'socket.io'

const debug = DEBUG('realtime')

type Transports = ('websocket' | 'polling')[]
const ALLOWED_TRANSPORTS: Transports = ['websocket', 'polling']
const VISITOR_ID_PREFIX = 'visitor:'

export class RealTimePayload {
  readonly eventName: string
  readonly payload: any

  constructor(eventName: string, payload: any) {
    this.eventName = eventName.toLowerCase()
    this.payload = payload
  }

  /**
   * Creates a payload to be send to a unique visitor.
   * A visitor is essentially a unique socket user surfing a Botpress-enabled interface.
   * Interfaces include the Botpress Dashboard and the Botpress Webchat.
   * @param visitorId The ID of the visitor, on the Webchat this is the channel-web `userId`
   */
  static forVisitor(visitorId: string, eventName: string, payload: any): RealTimePayload {
    if (!eventName.toLowerCase().startsWith('guest.')) {
      eventName = `guest.${eventName}`
    }

    return new RealTimePayload(eventName, {
      ...payload,
      __room: `visitor:${visitorId}`
    })
  }

  public static forAdmins(eventName: string, payload: any): RealTimePayload {
    return new RealTimePayload(eventName, payload)
  }
}

export class RealtimeService {
  private readonly ee: EventEmitter2
  private guest?: Socket.Namespace

  constructor() {
    this.ee = new EventEmitter2({
      wildcard: true,
      maxListeners: 100
    })

    // TODO: Fix this to enable logs... listen on Logger or stdout/stderr
    // this.sendToSocket(RealTimePayload.forAdmins(type as string, { level, message, args }))
  }

  private isEventTargeted(eventName: string | string[]): boolean {
    if (_.isArray(eventName)) {
      eventName = eventName[0]
    }

    return (eventName as string).startsWith('guest.')
  }

  private makeVisitorRoomId(visitorId: string): string {
    return `${VISITOR_ID_PREFIX}${visitorId}`
  }

  private unmakeVisitorId(roomId: string): string {
    return roomId.replace(`${VISITOR_ID_PREFIX}`, '')
  }

  sendToSocket(payload: RealTimePayload) {
    debug('Send %o', payload)
    this.ee.emit(payload.eventName, payload.payload, 'server')
  }

  async getVisitorIdFromSocketId(socketId: string): Promise<undefined | string> {
    let rooms: Set<string> | undefined
    try {
      rooms = this.guest?.adapter.sids.get(socketId)
    } catch (err) {
      return
    }

    if (!rooms?.size) {
      return
    }

    // rooms here contains one being socketId and all rooms in which user is connected
    // in the "guest" case it's a single room being the webchat and corresponds to the visitor id
    // resulting to something like ["/guest:lijasdioajwero", "visitor:kas9d2109das0"]
    rooms = new Set(rooms)
    rooms.delete(socketId)
    const [roomId] = rooms

    return roomId ? this.unmakeVisitorId(roomId) : undefined
  }

  async installOnHttpServer(server: Server) {
    const io = new Socket.Server(server, {
      path: `${process.ROOT_PATH}/socket.io`,
      cors: { origin: '*' },
      serveClient: false
    })

    const admin = io.of('/admin')
    this.setupAdminSocket(admin) // TODO: delete this

    const guest = io.of('/guest')
    this.setupGuestSocket(guest)

    this.ee.onAny((event, payload, from) => {
      if (from === 'client') {
        return // This is coming from the client, we don't send this event back to them
      }

      const connection = this.isEventTargeted(event) ? guest : admin

      if (payload && (payload.__socketId || payload.__room)) {
        // Send only to this socketId or room
        return connection.to(payload.__socketId || payload.__room).emit('event', {
          name: event,
          data: payload
        })
      }

      // broadcast event to the front-end clients
      connection.emit('event', { name: event, data: payload })
    })
  }

  setupAdminSocket(admin: Socket.Namespace): void {
    admin.on('connection', (socket: Socket.Socket) => {
      const visitorId = socket.handshake.query.visitorId as string

      socket.on('event', (event) => {
        if (!event?.name) {
          return
        }

        try {
          this.ee.emit(event.name, event.data, 'client', {
            visitorId,
            socketId: socket.id,
            guest: false,
            admin: true
          })
        } catch (err) {}
      })
    })
  }

  setupGuestSocket(guest: Socket.Namespace): void {
    this.guest = guest

    guest.on('connection', async (socket: Socket.Socket) => {
      const visitorId = socket.handshake.query.visitorId as string

      if (visitorId?.length > 0) {
        const roomId = this.makeVisitorRoomId(visitorId)

        await socket.join(roomId)
      }

      socket.on('event', (event) => {
        if (!event?.name) {
          return
        }

        this.ee.emit(event.name, event.data, 'client', {
          socketId: socket.id,
          visitorId,
          guest: true,
          admin: false
        })
      })
    })
  }
}
