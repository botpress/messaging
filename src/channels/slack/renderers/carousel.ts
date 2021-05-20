import _ from 'lodash'
import {
  ActionOpenURL,
  ActionPostback,
  ActionSaySomething,
  ButtonAction,
  CarouselContent
} from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { formatUrl } from '../../url'
import { SlackContext } from '../context'

export class SlackCarouselRenderer implements ChannelRenderer<SlackContext> {
  get priority(): number {
    return 0
  }

  handles(context: SlackContext): boolean {
    return !!context.payload.items?.length
  }

  render(context: SlackContext) {
    const payload = context.payload as CarouselContent

    context?.message?.blocks?.push(
      ..._.flatMap(payload.items, (card, cardIdx) => [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${card.title}*\n${card.subtitle}`
          },
          accessory: card.image && {
            type: 'image',
            image_url: formatUrl(context.botUrl, card.image),
            alt_text: 'image'
          }
        },
        {
          type: 'actions',
          elements: (card.actions || []).map((btn, btnIdx) => {
            if (btn.action === ButtonAction.SaySomething || btn.action === ButtonAction.Postback) {
              return {
                type: 'button',
                action_id: 'button_clicked' + cardIdx + btnIdx,
                text: {
                  type: 'plain_text',
                  text: btn.title
                },
                value: (btn as ActionSaySomething).text || (btn as ActionPostback).payload
              }
            } else if (btn.action === ButtonAction.OpenUrl) {
              return {
                type: 'button',
                action_id: 'discard_action' + cardIdx + btnIdx,
                text: {
                  type: 'plain_text',
                  text: btn.title
                },
                url: (btn as ActionOpenURL).url.replace('BOT_URL', context.botUrl)
              }
            } else {
              throw new Error(`Slack carousel does not support "${btn.action}" action-buttons at the moment`)
            }
          })
        }
      ])
    )
  }
}
