import { ReceiverEvent } from '@slack/bolt'
import crypto from 'crypto'
import { NextFunction, Response } from 'express'
import rawBody from 'raw-body'
import tsscmp from 'tsscmp'
import { URLSearchParams } from 'url'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { POSTBACK_PREFIX, SAY_PREFIX } from '../messenger/renderers/carousel'
import { QUICK_REPLY_PREFIX } from './renderers/choices'
import { SlackService } from './service'

export class SlackApi extends ChannelApi<SlackService> {
  async setup(router: ChannelApiManager) {
    router.post('/slack', this.verifyRequestSignature.bind(this))
    router.post('/slack', this.handleRequest.bind(this))

    this.service.on('start', this.handleStart.bind(this))
  }

  private async verifyRequestSignature(req: ChannelApiRequest, res: Response, next: NextFunction) {
    const signature = req.headers['x-slack-signature'] as string | undefined
    const requestTimestamp = req.headers['x-slack-request-timestamp'] as string | undefined
    const contentType = req.headers['content-type'] as string | undefined

    if (!signature || !requestTimestamp) {
      return res.sendStatus(401)
    }

    const ts = Number(requestTimestamp)
    if (isNaN(ts)) {
      return res.sendStatus(401)
    }

    // Divide current date to match Slack ts format
    // Subtract 5 minutes from current time
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5

    if (ts < fiveMinutesAgo) {
      // timestamp is too old
      return res.sendStatus(403)
    }

    const { config } = this.service.get(req.scope)
    const stringBody = (await rawBody(req)).toString()

    const hmac = crypto.createHmac('sha256', config.signingSecret)
    const [version, hash] = signature.split('=')
    hmac.update(`${version}:${ts}:${stringBody}`)

    if (!tsscmp(hash, hmac.digest('hex'))) {
      return res.sendStatus(403)
    }

    // interactive api works with url encoded and events api with json...
    if (contentType === 'application/x-www-form-urlencoded') {
      const parsedBody = new URLSearchParams(stringBody)
      // when we click a button, the payload is actually there in json string
      req.body = JSON.parse(parsedBody.get('payload')!)
    } else {
      req.body = JSON.parse(stringBody)
    }

    next()
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    if (req.body?.ssl_check) {
      return res.send()
    } else if (req.body?.type === 'url_verification') {
      return res.json({ challenge: req.body.challenge })
    } else {
      const event: ReceiverEvent = {
        body: req.body,
        ack: async (response) => {
          if (!response) {
            res.send('')
          } else if (typeof response === 'string') {
            res.send(response)
          } else {
            res.json(response)
          }
        }
      }

      const { app } = this.service.get(req.scope)
      await app.processEvent(event)
    }
  }

  private async handleStart({ scope }: { scope: string }) {
    const { app } = this.service.get(scope)

    app.message(async ({ message }) => {
      if ('bot_id' in message) {
        return
      }

      if ('user' in message) {
        await this.service.receive(
          scope,
          { identity: '*', sender: message.user, thread: message.channel },
          { type: 'text', text: message.text }
        )
      }
    })

    app.action({}, async ({ ack, action, body, respond }) => {
      if ('text' in action) {
        const actionId = action.action_id

        if (actionId.startsWith(SAY_PREFIX)) {
          await ack()

          await this.service.receive(
            scope,
            { identity: '*', sender: body.user.id, thread: body.channel?.id || '*' },
            { type: 'say_something', text: action.value }
          )
        } else if (actionId.startsWith(POSTBACK_PREFIX)) {
          await ack()

          await this.service.receive(
            scope,
            { identity: '*', sender: body.user.id, thread: body.channel?.id || '*' },
            { type: 'postback', payload: action.value }
          )
        } else if (actionId.startsWith(QUICK_REPLY_PREFIX)) {
          await respond({ text: `*${action.text.text}*` })

          await this.service.receive(
            scope,
            { identity: '*', sender: body.user.id, thread: body.channel?.id || '*' },
            { type: 'quick_reply', text: action.text.text, payload: action.value }
          )
        } else {
          await ack()
        }
      } else if (action.type === 'static_select') {
        await respond(`*${action.selected_option.text.text}*`)

        await this.service.receive(
          scope,
          { identity: '*', sender: body.user.id, thread: body.channel?.id || '*' },
          { type: 'quick_reply', text: action.selected_option.text.text, payload: action.selected_option.value }
        )
      }
    })
  }
}
