import Joi from 'joi'
import { Channel } from '../base/channel'

export class SocketChannel extends Channel<any> {
  get name() {
    return 'socket'
  }

  get id() {
    return '4bf4f45e-1106-469f-a11e-b01a9c1e20b7'
  }

  get schema() {
    return Joi.object()
  }

  createConduit() {
    return undefined as any
  }

  async setupRoutes() {}
}
