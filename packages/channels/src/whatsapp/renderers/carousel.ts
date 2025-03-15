
import { IndexChoiceOption, IndexChoiceType } from '../../base/context'
import { CarouselRenderer, CarouselContext } from '../../base/renderers/carousel'
import { ActionOpenURL, ActionPostback, ActionSaySomething, CardContent, CarouselContent } from '../../content/types'
import { WhatsappContext } from '../context'
import { WhatsappButton } from '../whatsapp'

type Context = CarouselContext<WhatsappContext> & {
  buttons: WhatsappButton[]
  options: IndexChoiceOption[]
  index: number
}

export class WhatsappCarouselRenderer extends CarouselRenderer {
  startRender(context: Context, carousel: CarouselContent) {
    context.options = []
  }

  startRenderCard(context: Context, card: CardContent) {
    context.buttons = []
  }

  renderButtonUrl(context: Context, button: ActionOpenURL) {
    context.buttons.push({
      type: 'reply',
      reply: {
        id: `${IndexChoiceType.OpenUrl}::${button.url}`.substring(0, 256),
        title: button.title.substring(0, 20)
      }
    })
  }

  renderButtonPostback(context: Context, button: ActionPostback) {
    context.buttons.push({
      type: 'reply',
      reply: {
        id: `${IndexChoiceType.PostBack}::${button.payload}`.substring(0, 256),
        title: button.title.substring(0, 20)
      }
    })
  }

  renderButtonSay(context: Context, button: ActionSaySomething) {
    context.buttons.push({
      type: 'reply',
      reply: {
        id: `${IndexChoiceType.SaySomething}::${button.text}`.substring(0, 256),
        title: button.title.substring(0, 20)
      }
    })
  }

  endRenderCard(context: Context, card: CardContent) {
    let message: any
    if (!context.buttons.length) {
      const text = card.subtitle ? `${card.title}\n\n${card.subtitle}` : card.title
      if (card.image) {
        message = {
          type: 'image',
          image: {
            link: card.image,
            caption: text.substring(0, 1024)
          }
        }
      } else {
        message = {
          type: 'text',
          text: {
            preview_url: true,
            body: text.substring(0, 4096)
          }
        }
      }
    } else if (context.buttons.length <= 3) {
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
    } else if (!card.image && context.buttons.length <= 10) {
      message = {
        type: 'interactive',
        interactive: {
          type: 'list',
          body: {
            text: card.title.substring(0, 4096)
          },
          action: {
            button: 'Select...',
            sections: [
              {
                rows: context.buttons.map((button) => ({
                  id: button.reply.id.substring(0, 200),
                  title: button.reply.title.substring(0, 24)
                }))
              }
            ]
          }
        }
      }
      if (card.subtitle) {
        message.interactive.footer = {
          text: card.subtitle.substring(0, 60)
        }
      }
    } else {
      const text = `${card.title}\n\n${card.subtitle || ''}\n\n${context.buttons
        .map(({ reply }, index) => `${index + context.options.length + 1}. ${reply.title}`)
        .join('\n')}`

      if (card.image) {
        message = {
          type: 'image',
          image: {
            link: card.image,
            caption: text.substring(0, 1024)
          }
        }
      } else {
        message = {
          type: 'text',
          text: {
            preview_url: false,
            body: text.substring(0, 4096)
          }
        }
      }
      context.options.push(...context.buttons.map((button) => {
        const [type, value] = button.reply.id.split('::') as [IndexChoiceType, string]
        return {
          type: type === IndexChoiceType.OpenUrl ? IndexChoiceType.SaySomething : type,
          title: button.reply.title,
          value
        }
      }))
    }
    context.channel.messages.push(message)
  }

  endRender(context: Context, carousel: CarouselContent) {
    if (context.options.length) {
      context.channel.prepareIndexResponse(
        context.channel.scope,
        context.channel.identity,
        context.channel.sender,
        context.options
      )
    }
  }
}
