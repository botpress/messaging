import { Emitter } from '@botpress/messaging-base'
import io, { Socket } from 'socket.io-client'

export class SocketCom {
  public readonly events: SocketComWatcher

  private emitter: SocketComEmitter
  private socket!: Socket
  private pending: { [request: string]: { resolve: (value: any) => void; reject: (reason?: any) => void } } = {}

  constructor(private url: string, private manualConnect: boolean) {
    this.emitter = new SocketComEmitter()
    this.events = this.emitter

    if (!this.manualConnect) {
      this.connect()
    }
  }

  connect() {
    this.socket = io(this.url.replace('http://', 'ws://').replace('https://', 'ws://'), {
      transports: ['websocket']
    })

    this.socket.on('connect', async () => {
      await this.emitter.emit(SocketComEvents.Connect, {})
    })

    this.socket.on('message', async (message) => {
      if (this.pending[message.request]) {
        if (message.data.error) {
          this.pending[message.request].reject(message.data.message)
        } else {
          this.pending[message.request].resolve(message.data)
        }
        delete this.pending[message.request]
      }

      await this.emitter.emit(SocketComEvents.Message, message)
    })
  }

  disconnect() {
    this.socket.disconnect()
  }

  async request<T>(type: string, data: any): Promise<T> {
    const request = this.random(32)
    const promise = new Promise<T>((resolve, reject) => {
      this.pending[request] = { resolve, reject }
    })

    this.socket.send({ request, type, data })

    return promise
  }

  private random(length: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let str = ''
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return str
  }
}

export enum SocketComEvents {
  Connect = 'connect',
  Message = 'message'
}

export interface SocketComMessageEvent {
  type: string
  data: any
}

export interface SocketComConnectEvent {}

export class SocketComEmitter extends Emitter<{
  [SocketComEvents.Connect]: SocketComConnectEvent
  [SocketComEvents.Message]: SocketComMessageEvent
}> {}

export type SocketComWatcher = Omit<SocketComEmitter, 'emit'>
