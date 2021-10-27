import { uuid } from '@botpress/messaging-base'
import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { Auth } from '../base/auth/auth'
import { ConversationService } from '../conversations/service'
import { ConverseService } from '../converse/service'
import { Schema } from './schema'
import { MessageService } from './service'

export class MessageApi {
  constructor(
    private router: Router,
    private auth: Auth,
    private conversations: ConversationService,
    private messages: MessageService,
    private converse: ConverseService
  ) {}

  async setup() {
    this.router.post(
      '/messages',
      this.auth.client.auth(async (req, res) => {
        const { error } = Schema.Api.Create.validate(req.body)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { conversationId, authorId, payload, collect, incomingId, timeout } = req.body
        const conversation = await this.conversations.get(conversationId)

        if (!conversation) {
          return res.sendStatus(404)
        } else if (conversation.clientId !== req.client!.id) {
          return res.sendStatus(403)
        }

        const messageId = uuidv4()
        const collector = collect ? this.converse.collect(messageId, conversationId, +timeout) : undefined
        if (incomingId) {
          this.converse.setIncomingId(messageId, incomingId)
        }

        const message = await this.messages.create(
          conversationId,
          authorId,
          payload,
          authorId
            ? undefined
            : {
                client: { id: req.client!.id }
              },
          messageId
        )

        if (collect) {
          res.send({ message, responses: await collector })
        } else {
          res.send(message)
        }
      })
    )

    this.router.post(
      '/messages/turn/:id',
      this.auth.client.auth(async (req, res) => {
        const { error } = Schema.Api.Turn.validate(req.params)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { id } = req.params

        const message = await this.messages.get(id)
        if (!message) {
          return res.sendStatus(404)
        }

        const conversation = await this.conversations.get(message.conversationId)
        if (!conversation) {
          return res.sendStatus(404)
        } else if (conversation.clientId !== req.client!.id) {
          return res.sendStatus(403)
        }

        await this.converse.stopCollecting(message.id, message.conversationId)
        res.sendStatus(200)
      })
    )

    this.router.get(
      '/messages/:id',
      this.auth.client.auth(async (req, res) => {
        const { error } = Schema.Api.Get.validate(req.params)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { id } = req.params
        const message = await this.messages.get(id)

        if (!message) {
          return res.sendStatus(404)
        }

        const conversation = await this.conversations.get(message.conversationId)
        if (conversation!.clientId !== req.client!.id) {
          return res.sendStatus(403)
        }

        res.send(message)
      })
    )

    this.router.get(
      '/messages',
      this.auth.client.auth(async (req, res) => {
        const { error } = Schema.Api.List.validate(req.query)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { conversationId, limit } = req.query
        const conversation = await this.conversations.get(conversationId as uuid)

        if (!conversation) {
          return res.sendStatus(404)
        } else if (conversation.clientId !== req.client!.id) {
          return res.sendStatus(403)
        }

        const messages = await this.messages.listByConversationId(conversationId as uuid, +(limit as string))

        res.send(messages)
      })
    )

    this.router.delete(
      '/messages',
      this.auth.client.auth(async (req, res) => {
        const { error } = Schema.Api.Delete.validate(req.query)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { id, conversationId } = req.query
        let deleted: number

        if (id) {
          const message = await this.messages.get(id as uuid)
          if (!message) {
            return res.sendStatus(400)
          }

          const conversation = await this.conversations.get(message.conversationId)
          if (conversation!.clientId !== req.client!.id) {
            return res.sendStatus(403)
          }

          deleted = await this.messages.delete(id as uuid)
        } else if (conversationId) {
          const conversation = await this.conversations.get(conversationId as string)

          if (!conversation) {
            return res.sendStatus(400)
          } else if (conversation!.clientId !== req.client!.id) {
            return res.sendStatus(403)
          }

          deleted = await this.messages.deleteByConversationId(conversationId as uuid)
        } else {
          return res.sendStatus(400)
        }

        res.send({ count: deleted })
      })
    )
  }
}
