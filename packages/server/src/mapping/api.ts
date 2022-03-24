import { Endpoint } from '@botpress/messaging-base'
import { Response } from 'express'
import { ApiManager } from '../base/api-manager'
import { ClientApiRequest } from '../base/auth/client'
import { ChannelService } from '../channels/service'
import { ConversationService } from '../conversations/service'
import { makeMapRequestSchema, Schema } from './schema'
import { MappingService } from './service'

export class MappingApi {
  constructor(
    private channels: ChannelService,
    private conversations: ConversationService,
    private mapping: MappingService
  ) {}

  setup(router: ApiManager) {
    router.post('/endpoints/map', makeMapRequestSchema(this.channels.list()), this.map.bind(this))
    router.get('/endpoints/conversation/:conversationId', Schema.Api.List, this.list.bind(this))
  }

  async map(req: ClientApiRequest, res: Response) {
    const endpoint = req.body as Endpoint
    let conversationId

    if (typeof endpoint.channel === 'string') {
      conversationId = (await this.mapping.getCustomMapping(req.clientId, endpoint.channel, endpoint)).conversationId
    } else {
      const channel = this.channels.getByNameAndVersion(endpoint.channel.name, endpoint.channel.version)
      conversationId = (await this.mapping.getMapping(req.clientId, channel.meta.id, endpoint)).conversationId
    }

    res.send({ conversationId })
  }

  async list(req: ClientApiRequest, res: Response) {
    const { conversationId } = req.params

    const conversation = await this.conversations.fetch(conversationId)
    if (!conversation || conversation.clientId !== req.clientId) {
      return res.sendStatus(404)
    }

    const convmaps = await this.mapping.convmap.listByConversationId(conversationId)
    const endpoints: Endpoint[] = []

    for (const convmap of convmaps) {
      const endpoint = await this.mapping.getEndpoint(convmap.threadId)
      const tunnel = (await this.mapping.tunnels.get(convmap.tunnelId))!
      let channel

      if (tunnel.customChannelName) {
        channel = tunnel.customChannelName
      } else {
        const channelMeta = this.channels.getById(tunnel.channelId!).meta
        channel = { name: channelMeta.name, version: channelMeta.version }
      }

      endpoints.push({ channel, ...endpoint })
    }

    res.send(endpoints)
  }
}
