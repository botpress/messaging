import {
  ButtonAction,
  ReceiverEvent,
  RespondFn,
  SlackAction,
  SlackActionMiddlewareArgs,
  SlackEventMiddlewareArgs,
  StaticSelectAction
} from '@slack/bolt'
import crypto from 'crypto'
import { NextFunction, Response } from 'express'
import rawBody from 'raw-body'
import tsscmp from 'tsscmp'
import { URLSearchParams } from 'url'
import { Endpoint } from '..'
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
    // The verification code is mostly copy pasted from the ExpressReceiver code
    // see : https://github.com/slackapi/bolt-js/blob/main/src/receivers/ExpressReceiver.ts

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
    app.message(async (e) => this.handleMessage(scope, e))
    app.action({}, async (e) => this.handleAction(scope, e))
  }

  private async handleMessage(scope: string, { message }: SlackEventMiddlewareArgs<'message'>) {
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
  }

  private async handleAction(scope: string, e: SlackActionMiddlewareArgs<SlackAction>) {
    const { body, action, respond, ack } = e
    const endpoint = { identity: '*', sender: body.user.id, thread: body.channel?.id || '*' }

    if (action.type === 'button' && 'text' in action) {
      await this.handleButtonAction(scope, { endpoint, action, respond })
    } else if (action.type === 'static_select') {
      await this.handleSelectAction(scope, { endpoint, action, respond })
    }

    await ack()
  }

  private async handleButtonAction(scope: string, e: SlackActionHandler<ButtonAction>) {
    const { respond, endpoint, action } = e

    if (action.action_id.startsWith(QUICK_REPLY_PREFIX)) {
      await respond({ text: `*${action.text.text}*` })

      await this.service.receive(scope, endpoint, {
        type: 'quick_reply',
        text: action.text.text,
        payload: action.value
      })
    } else {
      if (action.action_id.startsWith(SAY_PREFIX)) {
        await this.service.receive(scope, endpoint, { type: 'say_something', text: action.value })
      } else if (action.action_id.startsWith(POSTBACK_PREFIX)) {
        await this.service.receive(scope, endpoint, { type: 'postback', payload: action.value })
      }
    }
  }

  private async handleSelectAction(scope: string, e: SlackActionHandler<StaticSelectAction>) {
    const { respond, action, endpoint } = e

    await respond(`*${action.selected_option.text.text}*`)

    await this.service.receive(scope, endpoint, {
      type: 'quick_reply',
      text: action.selected_option.text.text,
      payload: action.selected_option.value
    })
  }
}

interface SlackActionHandler<T> {
  endpoint: Endpoint
  action: T
  respond: RespondFn
}
