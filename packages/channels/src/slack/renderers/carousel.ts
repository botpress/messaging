import { Button } from '@slack/bolt'
import { v4 as uuidv4 } from 'uuid'
import { CarouselContext, CarouselRenderer } from '../../base/renderers/carousel'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent } from '../../content/types'
import { SlackContext } from '../context'

export const POSTBACK_PREFIX = 'postback::'
export const SAY_PREFIX = 'say::'

type Context = CarouselContext<SlackContext> & {
  buttons: Button[]
}

export class SlackCarouselRenderer extends CarouselRenderer {
  startRenderCard(context: Context, card: CardContent) {
    context.buttons = []
  }

  renderButtonUrl(context: Context, button: ActionOpenURL) {
    context.buttons.push({
      type: 'button',
      text: {
        type: 'plain_text',
        text: button.title
      },
      url: button.url
    })
  }

  renderButtonPostback(context: Context, button: ActionPostback) {
    context.buttons.push({
      type: 'button',
      action_id: `${POSTBACK_PREFIX}${uuidv4()}`,
      text: {
        type: 'plain_text',
        text: button.title
      },
      value: button.payload
    })
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.buttons.push({
      type: 'button',
      action_id: `${SAY_PREFIX}${uuidv4()}`,
      text: {
        type: 'plain_text',
        text: button.title
      },
      value: button.text
    })
  }

  endRenderCard(context: Context, card: CardContent) {
    context.channel.message.blocks.push(
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${card.title}*\n${card.subtitle}`
        },
        accessory: card.image
          ? {
              type: 'image',
              image_url: card.image,
              alt_text: 'image'
            }
          : undefined
      },
      {
        type: 'actions',
        elements: context.buttons
      }
    )
  }
}
