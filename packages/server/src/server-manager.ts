import { IncomingMessage, Server, ServerResponse } from 'http'
import { Socket } from 'net'
import { Duplex } from 'stream'

export class ServerManager {
  private sockets: Socket[] = []
  private duplexes: Set<Duplex> = new Set()
  private terminating = false

  constructor(private server: Server) {
    this.startWatchingServer()
  }

  public async terminate() {
    this.terminating = true

    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err)
        } else {
          for (const socket of this.sockets) {
            this.closeConnection(socket)
          }

          for (const duplex of this.duplexes) {
            this.closeConnection(duplex)
          }

          resolve(undefined)
        }
      })
    })
  }

  private startWatchingServer() {
    this.server.on('connection', this.onConnection.bind(this))
    this.server.on('request', this.onRequest.bind(this))
  }

  private onConnection(connection: Duplex) {
    this.duplexes.add(connection)

    connection.on('close', () => this.duplexes.delete(connection))
  }

  private onRequest(request: IncomingMessage, response: ServerResponse) {
    const connection = request.connection

    response.on('finish', () => {
      if (this.terminating) {
        this.closeConnection(connection)
      }
    })
  }

  private closeConnection(connection: Socket | Duplex) {
    if (!connection.destroyed) {
      connection.destroy()
    }
  }
}
