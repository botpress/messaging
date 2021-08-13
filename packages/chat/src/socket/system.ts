import io, { Socket } from 'socket.io-client'
import { SocketEmitter, SocketEvents, SocketWatcher } from './events'

export class WebchatSocket {
  public readonly events: SocketWatcher

  private emitter: SocketEmitter
  private socket!: Socket
  private pending: { [request: string]: (value: any) => void } = {}

  constructor(private url: string) {
    this.emitter = new SocketEmitter()
    this.events = this.emitter
  }

  async setup() {
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

      await this.emitter.emit(SocketEvents.Message, data)
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
