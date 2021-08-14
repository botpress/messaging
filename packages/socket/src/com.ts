import { Emitter } from '@botpress/messaging-base'
import io, { Socket } from 'socket.io-client'

export class SocketCom {
  public readonly events: SocketComWatcher

  private emitter: SocketComEmitter
  private socket!: Socket
  private pending: { [request: string]: (value: any) => void } = {}

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

    this.socket.on('connect', () => {
      this.socket.send({ type: 'visit' })
    })

    this.socket.on('message', async (data) => {
      if (this.pending[data.request]) {
        this.pending[data.request](data.data)
        delete this.pending[data.request]
      }

      await this.emitter.emit(SocketComEvents.Message, data)
    })
  }

  async request<T>(type: string, data: any): Promise<T> {
    const request = this.random(32)
    const promise = new Promise<T>((resolve) => {
      this.pending[request] = resolve
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
