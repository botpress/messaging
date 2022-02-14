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

    // TODO: terrible name. To be renamed to something else. Both routes are likely to change name
    router.post('/endpoints/reverse', Schema.Api.Revmap, this.revmap.bind(this))
  }

  async map(req: ClientApiRequest, res: Response) {
    const endpoint = req.body as Endpoint

    const channel = this.channels.getByNameAndVersion(endpoint.channel.name, endpoint.channel.version)
    const { conversationId } = await this.mapping.getMapping(req.clientId, channel.meta.id, endpoint)

    res.send({ conversationId })
  }

  async revmap(req: ClientApiRequest, res: Response) {
    const { conversationId } = req.body

    const convmaps = await this.mapping.convmap.listByConversationId(conversationId)
    const endpoints = []

    for (const convmap of convmaps) {
      const endpoint = await this.mapping.getEndpoint(convmap.threadId)
      const tunnel = await this.mapping.tunnels.get(convmap.tunnelId)
      const channel = this.channels.getById(tunnel!.channelId)

      endpoints.push({ channel: { name: channel.meta.name, version: channel.meta.version }, ...endpoint })
    }

    res.send(endpoints)
  }
}
