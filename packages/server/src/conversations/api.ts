import { Router } from 'express'
import { Auth } from '../base/auth/auth'
import { Schema } from './schema'
import { ConversationService } from './service'

export class ConversationApi {
  constructor(private router: Router, private auth: Auth, private conversations: ConversationService) {}

  async setup() {
    this.router.post(
      '/conversations',
      this.auth.client.auth(async (req, res) => {
        const { error } = Schema.Api.Create.validate(req.body)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { userId } = req.body
        const conversation = await this.conversations.create(req.client!.id, userId)

        res.send(conversation)
      })
    )

    this.router.get(
      '/conversations/:id',
      this.auth.client.auth(async (req, res) => {
        const { error } = Schema.Api.Get.validate(req.params)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { id } = req.params
        const conversation = await this.conversations.get(id)

        if (conversation && conversation.clientId !== req.client!.id) {
          return res.sendStatus(403)
        } else if (!conversation) {
          return res.sendStatus(404)
        }

        res.send(conversation)
      })
    )

    this.router.get(
      '/conversations',
      this.auth.client.auth(async (req, res) => {
        const { error } = Schema.Api.List.validate(req.query)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { userId, limit } = req.query
        const conversations = await this.conversations.listByUserId(
          req.client!.id,
          userId as string,
          +(limit as string)
        )

        res.send(conversations)
      })
    )

    this.router.get(
      '/conversations/:userId/recent',
      this.auth.client.auth(async (req, res) => {
        const { error } = Schema.Api.Recent.validate(req.params)
        if (error) {
          return res.status(400).send(error.message)
        }

        const { userId } = req.params
        let conversation = await this.conversations.getMostRecent(req.client!.id, userId)
        if (!conversation) {
          conversation = await this.conversations.create(req.client!.id, userId)
        }

        res.send(conversation)
      })
    )
  }
}
