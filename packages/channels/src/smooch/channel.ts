import { Channel } from '../base/channel'
import { SmoochApi } from './api'
import { SmoochConfig, SmoochConfigSchema } from './config'
import { SmoochService } from './service'
import { SmoochStream } from './stream'

export class SmoochChannel extends Channel<SmoochConfig, SmoochService, SmoochApi, SmoochStream> {
  get meta() {
    return {
      id: '3c5c160f-d673-4ef8-8b6f-75448af048ce',
      name: 'smooch',
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
