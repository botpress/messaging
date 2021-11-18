import clc from 'cli-color'
import { Logger } from '../../logger/types'
import { RedisSubservice } from './subservice'

export class PingPong {
  private known: { [foreignNodeId: number]: boolean } = {}

  constructor(private nodeId: number, private distributed: RedisSubservice, private logger: Logger) {}

  async setup() {
    await this.distributed.listen('ping', async (ping: PingEvent) => {
      this.acknowledge(ping.name)
      void this.pong(ping.name)
    })

    await this.distributed.listen('pong', async (pong: PongEvent) => {
      if (pong.to === this.nodeId) {
        this.acknowledge(pong.name)
      }
    })

    await this.distributed.send('ping', { name: this.nodeId })
  }

  async ping() {
    return this.distributed.send('ping', { name: this.nodeId })
  }

  async pong(to: number) {
    return this.distributed.send('pong', { to, name: this.nodeId })
  }

  acknowledge(foreignNodeId: number) {
    if (!this.known[foreignNodeId]) {
      this.logger.info(`Registered foreign node ${clc.bold(foreignNodeId)}`)
      this.known[foreignNodeId] = true
    }
  }
}

interface PingEvent {
  name: number
}

interface PongEvent {
  name: number
  to: number
}
