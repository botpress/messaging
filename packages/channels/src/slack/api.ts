import axios from 'axios'
import { Response } from 'express'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { SlackService } from './service'

export class SlackApi extends ChannelApi<SlackService> {
  async setup(router: ChannelApiManager) {
    router.post('/slack/interactive', this.handleInteractiveRequest.bind(this))
    router.post('/slack/events', this.handleEventRequest.bind(this))

    this.service.on('start', this.handleStart.bind(this))
  }

  private async handleInteractiveRequest(req: ChannelApiRequest, res: Response) {
    const { handleInteractiveRequest } = this.service.get(req.scope)
    return handleInteractiveRequest!(req, res)
  }

  private async handleEventRequest(req: ChannelApiRequest, res: Response) {
    const { handleEventRequest } = this.service.get(req.scope)
    return handleEventRequest!(req, res)
  }

  private async handleStart({ scope }: { scope: string }) {
    const { interactive, events } = this.service.get(scope)

    interactive.action({ type: 'button' }, async (e) => {
      await this.handleButtonInteractiveAction(scope, e)
    })
    interactive.action({ actionId: 'option_selected' }, async (e) => {
      await this.handleOptionSelectedInteractiveAction(scope, e)
    })
    this.service.get(scope).handleInteractiveRequest = interactive.requestListener()

    events.on('message', async (e) => {
      await this.handleMessageEvent(scope, e)
    })
    events.on('error', (e) => console.error('An error occurred', e))
    this.service.get(scope).handleEventRequest = events.requestListener()
  }

  private async handleButtonInteractiveAction(scope: string, payload: any) {
    try {
      const action = payload?.actions?.[0]
      const actionId = action?.action_id

      if (actionId.startsWith('discard_action')) {
        return
      } else if (actionId.startsWith('quick_reply')) {
        await axios.post(payload.response_url, { text: `*${action?.text?.text}*` })
        await this.receive(scope, {
          ctx: payload,
          content: { type: 'quick_reply', text: action?.text?.text, payload: action?.value }
        })
      } else if (actionId.startsWith('say_something')) {
        await this.receive(scope, {
          ctx: payload,
          content: { type: 'say_something', text: action?.value }
        })
      } else {
        await this.receive(scope, {
          ctx: payload,
          content: { type: 'postback', payload: action?.value }
        })
      }
    } catch (e) {
      console.error('Error occurred while processing a "button" interactive action', e)
    }
  }

  private async handleOptionSelectedInteractiveAction(scope: string, payload: any) {
    try {
      const action = payload?.actions?.[0]?.selected_option
      const label = action?.text?.text

      await axios.post(payload.response_url, { text: `*${label}*` })

      await this.receive(scope, {
        ctx: payload,
        content: { type: 'quick_reply', text: label, payload: action?.value }
      })
    } catch (e) {
      console.error('Error occurred while processing a "option_selected" interactive action', e)
    }
  }

  private async handleMessageEvent(scope: string, payload: any) {
    try {
      if (payload.bot_id || ['bot_message', 'message_deleted', 'message_changed'].includes(payload.subtype)) {
        return
      }

      await this.receive(scope, {
        ctx: payload,
        content: {
          type: 'text',
          text: payload.text
        }
      })
    } catch (e) {
      console.error('Error occurred while processing a slack message', e)
    }
  }

  private async receive(scope: string, payload: { ctx: any; content: any }) {
    const { user, channel } = payload.ctx

    const channelId = channel?.id || channel
    const userId = user?.id || user

    await this.service.receive(scope, { identity: '*', sender: userId, thread: channelId }, payload.content)
  }
}
