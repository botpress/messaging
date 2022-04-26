import { EventEmitter2 } from 'eventemitter2'
import { Socket, io } from 'socket.io-client'
import * as auth from '~/components/Shared/auth'
import { authEvents } from '~/util/Auth'

class EventBus extends EventEmitter2 {
  private adminSocket: Socket
  private guestSocket: Socket
  static default: EventBus

  constructor() {
    super({
      wildcard: true,
      maxListeners: 100
    })

    this.onAny(this.dispatchClientEvent)
    authEvents.on('new_token', this.setup)
  }

  dispatchSocketEvent = (event) => {
    this.emit(event.name, event.data, 'server')
  }

  dispatchClientEvent = (name, data, from) => {
    if (from === 'server') {
      // we sent this event ourselves
      return
    }

    const socket = name.startsWith('guest.') ? this.guestSocket : this.adminSocket
    socket && socket.emit('event', { name, data })
  }

  updateVisitorId = (newId: string, userIdScope?: string) => {
    auth.setVisitorId(newId, userIdScope)
  }

  private updateVisitorSocketId() {
    window.__BP_VISITOR_SOCKET_ID = this.guestSocket.id
  }

  setup = (userIdScope?: string) => {
    // TODO: implement this when the studio is executed as a standalone, since the socket is provided by the core
    // if (!window.BP_SERVER_URL) {
    //   console.warn('No server configured, socket is disabled')
    //   return
    // }

    const query = {
      visitorId: auth.getUniqueVisitorId(userIdScope)
    }

    if (this.adminSocket) {
      this.adminSocket.off('event', this.dispatchSocketEvent)
      this.adminSocket.disconnect()
    }

    if (this.guestSocket) {
      this.guestSocket.off('event', this.dispatchSocketEvent)
      this.guestSocket.off('connect', this.updateVisitorSocketId)
      this.guestSocket.disconnect()
    }

    const socketUrl = window['BP_SOCKET_URL'] || window.location.origin
    const transports = window.SOCKET_TRANSPORTS
    const token = auth.getToken()

    this.adminSocket = io(`${socketUrl}/admin`, {
      auth: { token },
      query,
      transports,
      path: `${window['ROOT_PATH']}/socket.io`
    })
    this.adminSocket.on('event', this.dispatchSocketEvent)

    this.guestSocket = io(`${socketUrl}/guest`, { query, transports, path: `${window['ROOT_PATH']}/socket.io` })

    this.guestSocket.on('connect', this.updateVisitorSocketId.bind(this))
    this.guestSocket.on('event', this.dispatchSocketEvent)
  }
}

EventBus.default = new EventBus()

export default EventBus
