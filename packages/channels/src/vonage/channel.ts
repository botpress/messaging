import { ChannelTemplate } from '../base/channel'
import { VonageApi } from './api'
import { VonageConfig, VonageConfigSchema } from './config'
import { VonageService } from './service'
import { VonageStream } from './stream'

export class VonageChannel extends ChannelTemplate<VonageConfig, VonageService, VonageApi, VonageStream> {
  get meta() {
    return {
      id: 'bf045a3c-5627-416d-974d-5cfeb277a23f',
      name: 'vonage',
      version: '0.1.0',
      schema: VonageConfigSchema,
      initiable: false,
      lazy: true
    }
  }

  constructor() {
    const service = new VonageService()
    super(service, new VonageApi(service), new VonageStream(service))
  }
}
