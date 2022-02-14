import { Endpoint } from '@botpress/messaging-base'
import { Response } from 'express'
import { ApiManager } from '../base/api-manager'
import { ClientApiRequest } from '../base/auth/client'
import { ChannelService } from '../channels/service'
import { Schema } from './schema'
import { MappingService } from './service'

export class MappingApi {
  constructor(private channels: ChannelService, private mapping: MappingService) {}

  setup(router: ApiManager) {
    router.post('/endpoints', Schema.Api.Map, this.map.bind(this))
  }

  async map(req: ClientApiRequest, res: Response) {
    const endpoint = req.body as Endpoint

    const channel = this.channels.getByNameAndVersion(endpoint.channel.name, endpoint.channel.version)
    const { conversationId } = await this.mapping.getMapping(req.clientId, channel.meta.id, endpoint)

    res.send({ conversationId })
  }
}
