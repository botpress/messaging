import { ChannelTemplate } from '../base/channel'
import { SmoochApi } from './api'
import { SmoochConfig, SmoochConfigSchema } from './config'
import { SmoochService } from './service'
import { SmoochStream } from './stream'

export class SmoochChannel extends ChannelTemplate<SmoochConfig, SmoochService, SmoochApi, SmoochStream> {
  get meta() {
    return {
      id: '82c7a7ee-f1c9-4fb6-8306-18f03d6aadc9',
      name: 'smooch',
      version: '1.0.0',
      schema: SmoochConfigSchema,
      initiable: true,
      lazy: true
    }
  }

  constructor() {
    const service = new SmoochService()
    super(service, new SmoochApi(service), new SmoochStream(service))
  }
}
