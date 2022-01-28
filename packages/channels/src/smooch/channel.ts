import { ChannelTemplate } from '../base/channel'
import { SmoochApi } from './api'
import { SmoochConfig, SmoochConfigSchema } from './config'
import { SmoochService } from './service'
import { SmoochStream } from './stream'

export class SmoochChannel extends ChannelTemplate<SmoochConfig, SmoochService, SmoochApi, SmoochStream> {
  get meta() {
    return {
      id: '3c5c160f-d673-4ef8-8b6f-75448af048ce',
      name: 'smooch',
      version: '0.1.0',
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
