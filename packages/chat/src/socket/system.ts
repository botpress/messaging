import io, { Socket } from 'socket.io-client'

export class WebchatSocket {
  private socket!: Socket
  private pending: { [request: string]: (value: any) => void } = {}

  constructor(private url: string) {}

  async setup() {
    this.socket = io(this.url.replace('http://', 'ws://').replace('https://', 'ws://'))

    this.socket.on('connect', () => {
      this.socket.send({ type: 'visit' })
    })

    this.socket.on('message', (data) => {
      if (this.pending[data.request]) {
        this.pending[data.request](data)
        delete this.pending[data.request]
      }
    })
  }

  async send(data: any) {
    this.socket.send(data)
  }

  async request(type: string, data: any) {
    const request = this.random(32)
    const promise = new Promise((resolve) => {
      this.pending[request] = resolve
    })

    this.socket.emit('message', { request, type, data })

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
