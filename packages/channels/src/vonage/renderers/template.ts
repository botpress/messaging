import { ChannelRenderer } from '../../base/renderer'
import { VonageContext } from '../context'

export class VonageTemplateRenderer implements ChannelRenderer<VonageContext> {
  get priority(): number {
    return 0
  }

  handles(context: VonageContext): boolean {
    return context.payload.type === 'vonage-template'
  }

  async render(context: VonageContext) {
    const payload = context.payload

    context.messages.push({
      message_type: 'template',
      whatsapp: { policy: 'deterministic', locale: payload.languageCode || 'en_US' },
      template: {
        name: `${payload.namespace}:${payload.name}`,
        parameters: payload.parameters
      }
    })
  }
}
