import { Emitter, uuid } from '@botpress/messaging-base'
import io, { Socket } from 'socket.io-client'
import { UserCredentials } from './socket'

export class SocketCom {
  public readonly events: SocketComWatcher

  private emitter: SocketComEmitter
  private socket: Socket | undefined
  private pending: { [request: string]: { resolve: (value: any) => void; reject: (reason?: any) => void } } = {}

  constructor(private url: string) {
    this.emitter = new SocketComEmitter()
    this.events = this.emitter
  }

  async connect(auth: { clientId: uuid; creds?: UserCredentials }): Promise<UserCredentials> {
    return new Promise((resolve, reject) => {
      this.disconnect()

      this.socket = io(this.url, {
        transports: ['websocket'],
        auth,
        autoConnect: false
      })

      const timeout = setTimeout(() => {
        reject('connection timed out')
      }, 5000)

      this.socket.on('login', async (message) => {
        clearTimeout(timeout)
        resolve(message)
      })

      this.socket.on('connect_error', (err) => {
        this.socket?.close()
        clearTimeout(timeout)
        reject(err.message)
      })

      this.socket.on('message', async (message) => {
        if (this.pending[message.request]) {
          if (message.data?.error) {
            this.pending[message.request].reject(new Error(message.data.message))
          } else {
            this.pending[message.request].resolve(message.data)
          }
          delete this.pending[message.request]
        }

        await this.emitter.emit(SocketComEvents.Message, message)
      })

      this.socket.connect()
    })
  }

  disconnect() {
    if (this.socket && !this.socket?.disconnected) {
      this.socket.disconnect()
    }
  }

  async request<T>(type: string, data: any): Promise<T> {
    if (!this.socket?.connected) {
      throw new Error('Client is disconnected')
    }

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
  Message = 'message'
}

export interface SocketComMessageEvent {
  type: string
  data: any
}

export class SocketComEmitter extends Emitter<{
  [SocketComEvents.Message]: SocketComMessageEvent
}> {}

export type SocketComWatcher = Omit<SocketComEmitter, 'emit'>
