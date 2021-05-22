import { ActionOpenURL, ActionPostback, ButtonAction, CarouselContent } from '../../../content/types'
import { ChannelRenderer } from '../../base/renderer'
import { formatUrl } from '../../url'
import { Card, SmoochContext } from '../context'

export class SmoochCarouselRenderer implements ChannelRenderer<SmoochContext> {
  get priority(): number {
    return 0
  }

  handles(context: SmoochContext): boolean {
    return !!context.payload.items?.length
  }

  async render(context: SmoochContext) {
    const payload = context.payload as CarouselContent

    const cards = []
    for (const bpCard of payload.items) {
      const card: Card = {
        title: bpCard.title as string,
        description: bpCard.subtitle as string,
        actions: []
      }

      // Smooch crashes if mediaUrl is defined but has no value
      if (bpCard.image) {
        card.mediaUrl = formatUrl(context.botUrl, bpCard.image)
      }

      for (const button of bpCard.actions || []) {
        if (button.action === ButtonAction.OpenUrl) {
          card.actions.push({
            text: button.title,
            type: 'link',
            uri: (button as ActionOpenURL).url.replace('BOT_URL', context.botUrl)
          })
        } else if (button.action === ButtonAction.Postback) {
          // This works but postback doesn't do anything
          card.actions.push({
            text: button.title,
            type: 'postback',
            payload: (button as ActionPostback).payload
          })
        } /* else if (bpAction.type === 'say_something') {
          card.actions.push({
            text: bpAction.title,
            type: 'reply',
            payload: bpAction.text
          })
        }*/
      }

      if (card.actions.length === 0) {
        // Smooch crashes if this list is empty or undefined. However putting this dummy
        // card in seems to produce the expected result (that is seeing 0 actions)
        card.actions.push({
          text: '',
          type: 'postback',
          payload: ''
        })
      }

      cards.push(card)
    }

    context.messages.push({ type: 'carousel', items: cards })
  }
}
