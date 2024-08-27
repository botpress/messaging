import { CarouselRenderer, CarouselContext } from '../../base/renderers/carousel'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent, CarouselContent } from '../../content/types'
import { WhatsappContext } from '../context'
import { WhatsappButton, WhatsappOutgoingMessage } from '../whatsapp'

type Context = CarouselContext<WhatsappContext> & {
  buttons: WhatsappButton[]
}

export class WhatsappCarouselRenderer extends CarouselRenderer {
  startRender(context: Context, carousel: CarouselContent) {}

  startRenderCard(context: Context, card: CardContent) {
    context.buttons = []
  }

  renderButtonUrl(context: Context, button: ActionOpenURL) {
    context.buttons.push({
      type: 'reply',
      reply: {
        id: `open_url::${button.url}`,
        title: button.title.substring(0, 20)
      }
    })
  }

  renderButtonPostback(context: Context, button: ActionPostback) {
    context.buttons.push({
      type: 'reply',
      reply: {
        id: `postback::${button.payload}`,
        title: button.title.substring(0, 20)
      }
    })
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.buttons.push({
      type: 'reply',
      reply: {
        id: `say_something::${button.text}`,
        title: button.title.substring(0, 20)
      }
    })
  }

  endRenderCard(context: Context, card: CardContent) {
    let message: WhatsappOutgoingMessage

    if (!context.buttons.length) {
      if (card.image) {
        message = {
          type: 'image',
          image: {
            link: card.image,
            caption: card.subtitle ? `${card.title}\n\n${card.subtitle}` : card.title
          }
        }
      } else {
        message = {
          type: 'text',
          text: {
            preview_url: true,
            body: card.subtitle ? `${card.title}\n\n${card.subtitle}` : card.title
          }
        }
      }
    } else if (1 <= context.buttons.length && context.buttons.length <= 10) {
      if (context.buttons.length <= 3) {
        message = {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: {
              text: card.title.substring(0, 1024)
            },
            action: {
              buttons: context.buttons
            }
          }
        }
      } else {
        message = {
          type: 'interactive',
          interactive: {
            type: 'list',
            body: {
              text: card.title.substring(0, 1024)
            },
            action: {
              button: 'Select...',
              sections: [
                {
                  rows: context.buttons.map((button) => ({
                    id: button.reply.id,
                    title: button.reply.title
                  }))
                }
              ]
            }
          }
        }
      }
      if (message.interactive) {
        if (card.image) {
          message.interactive.header = {
            type: 'image',
            image: {
              link: card.image
            }
          }
        }
        if (card.subtitle) {
          message.interactive.footer = {
            text: card.subtitle.substring(0, 60)
          }
        }
      }
    } else {
      const text = `*${card.title}*\n\n${card.subtitle ? `${card.subtitle}\n\n` : ''}
        ${context.buttons.map(({ reply }, index) => `*${index + 1}.)* ${reply.title}`)
        .join('\n')}`

      if (card.image) {
        message = {
          type: 'image',
          image: {
            link: card.image,
            caption: text
          }
        }
      } else {
        message = {
          type: 'text',
          text: {
            preview_url: false,
            body: text
          }
        }
      }
    }
    context.channel.messages.push(message)
  }

  endRender(context: Context, carousel: CarouselContent) {}
}
