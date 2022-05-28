import { EventEmitter2 } from 'eventemitter2'
import { Socket, io } from 'socket.io-client'

import * as auth from '../components/Shared/auth'
import { authEvents } from '../util/Auth'

class EventBus extends EventEmitter2 {
  private socket: Socket
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

    this.socket?.emit('event', { name, data })
  }

  updateVisitorId = (newId: string, userIdScope?: string) => {
    auth.setVisitorId(newId, userIdScope)
  }

  private updateVisitorSocketId() {
    window.__BP_VISITOR_SOCKET_ID = this.socket.id
  }

  setup = (userIdScope?: string) => {
    if (this.socket) {
      this.socket.off('event', this.dispatchSocketEvent)
      this.socket.off('connect', this.updateVisitorSocketId)
      this.socket.disconnect()
    }

    const socketUrl = window['BP_SOCKET_URL']

    this.socket = io(socketUrl)
    this.socket.on('connect', this.updateVisitorSocketId.bind(this))
    this.socket.on('event', this.dispatchSocketEvent)
  }
}

EventBus.default = new EventBus()

export default EventBus
