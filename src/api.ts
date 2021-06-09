import express, { Router, Request, Response, NextFunction } from 'express'
import { App } from './app'
import { ChannelApi } from './channels/api'
import { Client } from './clients/types'
import { ConversationApi } from './conversations/api'
import { MessageApi } from './messages/api'

export class Api {
  private router!: Router

  conversations: ConversationApi
  messages: MessageApi
  channels: ChannelApi

  constructor(private app: App, private root: Router) {
    this.router = Router()
    this.conversations = new ConversationApi(this.router, app.clients, app.conversations)
    this.messages = new MessageApi(this.router, app.clients, app.messages)
    this.channels = new ChannelApi(this.root, this.app)
  }

  async setup() {
    this.router.use(express.json())
    this.router.use(express.urlencoded({ extended: true }))

    this.root.use('/api', this.extractClient.bind(this), this.router)

    this.router.post('/send', async (req: ApiRequest, res) => {
      const { channel, conversationId, payload } = req.body

      const channelId = this.app.channels.getByName(channel).id
      const conduit = await this.app.conduits.getInstanceByProviderId(req.client!.providerId, channelId)
      await conduit.send(conversationId, payload)

      res.sendStatus(200)
    })

    await this.conversations.setup()
    await this.messages.setup()
    await this.channels.setup()
  }

  async extractClient(req: ApiRequest, res: Response, next: NextFunction) {
    const clientId = req.headers['client-id'] as string
    const clientToken = req.headers['client-token'] as string
    const client = await this.app.clients.getByIdAndToken(clientId, clientToken)

    if (!client) {
      return res.sendStatus(403)
    } else {
      req.client = client
      next()
    }
  }
}

export type ApiRequest = Request & {
  client?: Client
}
