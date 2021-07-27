import { Button } from '@slack/web-api'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent } from '../../../content/types'
import { CarouselContext, CarouselRenderer } from '../../base/renderers/carousel'
import { SlackContext } from '../context'

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
      action_id: 'discard_action' + uuidv4(),
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
      action_id: 'postback' + uuidv4(),
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
      action_id: 'say_something' + uuidv4(),
      text: {
        type: 'plain_text',
        text: button.title
      },
      value: button.text
    })
  }

  endRenderCard(context: Context, card: CardContent) {
    context.channel.message.blocks?.push(
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
