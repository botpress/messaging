import { ChannelRenderer } from '../../base/renderer'
import { VonageContext } from '../context'

export class VonageMediaTemplateRenderer implements ChannelRenderer<VonageContext> {
  get priority(): number {
    return 0
  }

  handles(context: VonageContext): boolean {
    return context.payload.type === 'vonage-media-template'
  }

  async render(context: VonageContext) {
    const payload = context.payload

    // TODO: Add support for footers
    const headerParameters = payload.header?.parameters || []
    const bodyParameters = payload.body?.parameters || []
    const buttonParameters = payload.buttons || []
    const languageCode = (payload.languageCode || 'en_US') as string

    const components = []

    if (headerParameters.length) {
      components.push({
        type: 'header',
        parameters: headerParameters
      })
    }

    if (bodyParameters.length) {
      components.push({
        type: 'body',
        parameters: bodyParameters
      })
    }

    if (buttonParameters.length) {
      buttonParameters.forEach((button: any, index: number) => {
        components.push({
          type: 'button',
          sub_type: button.subType,
          index,
          parameters: button.parameters
        })
      })
    }

    const language = {
      code: languageCode,
      policy: 'deterministic'
    }
    const custom = {
      type: 'template',
      template: {
        namespace: payload.namespace,
        name: payload.name,
        language,
        components
      }
    }

    context.messages.push({ message_type: 'custom', custom })
  }
}
