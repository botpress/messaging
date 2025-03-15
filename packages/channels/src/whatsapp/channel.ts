import { ChannelTemplate } from '../base/channel'
import { WhatsappApi } from './api'
import { WhatsappConfig, WhatsappConfigSchema } from './config'
import { WhatsappService } from './service'
import { WhatsappStream } from './stream'

export class WhatsappChannel extends ChannelTemplate<
  WhatsappConfig,
  WhatsappService,
  WhatsappApi,
  WhatsappStream
> {
  get meta() {
    return {
      id: '1a01c610-e7eb-4c47-97de-66ab348f473f',
      name: 'whatsapp',
      version: '1.0.0',
      schema: WhatsappConfigSchema,
      initiable: true,
      lazy: true
    }
  }

  constructor() {
    const service = new WhatsappService()
    super(service, new WhatsappApi(service), new WhatsappStream(service))
  }
}
