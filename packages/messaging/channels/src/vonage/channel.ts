import { ChannelTemplate } from '../base/channel'
import { VonageApi } from './api'
import { VonageConfig, VonageConfigSchema } from './config'
import { VonageService } from './service'
import { VonageStream } from './stream'

export class VonageChannel extends ChannelTemplate<VonageConfig, VonageService, VonageApi, VonageStream> {
  get meta() {
    return {
      id: 'd6073ed2-5603-4f5b-bcef-0a4bc75ef113',
      name: 'vonage',
      version: '1.0.0',
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
