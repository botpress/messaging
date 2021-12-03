import { Channel } from '../base/channel'
import { TeamsApi } from './api'
import { TeamsConfig, TeamsConfigSchema } from './config'
import { TeamsService } from './service'
import { TeamsStream } from './stream'

export class TeamsChannel extends Channel<TeamsConfig, TeamsService, TeamsApi, TeamsStream> {
  get meta() {
    return {
      id: '0491806d-ceb4-4397-8ebf-b8e6deb038da',
      name: 'teams',
      schema: TeamsConfigSchema,
      initiable: false,
      lazy: true
    }
  }

  constructor() {
    const service = new TeamsService()
    super(service, new TeamsApi(service), new TeamsStream(service))
  }
}
