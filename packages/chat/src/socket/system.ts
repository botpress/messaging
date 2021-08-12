import io, { Socket } from 'socket.io-client'

export class WebchatSocket {
  private socket!: Socket

  constructor(private url: string) {}

  async setup() {
    this.socket = io(this.url.replace('http://', 'ws://').replace('https://', 'ws://'), {
      path: '/api/users/socket'
    })

    this.socket.on('connect', () => {
      this.socket.send({ type: 'visit' })
    })
  }

  async send(data: any) {
    this.socket.send(data)
  }
}
