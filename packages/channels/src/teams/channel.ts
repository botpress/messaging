import { ChannelTemplate } from '../base/channel'
import { TeamsApi } from './api'
import { TeamsConfig, TeamsConfigSchema } from './config'
import { TeamsService } from './service'
import { TeamsStream } from './stream'

export class TeamsChannel extends ChannelTemplate<TeamsConfig, TeamsService, TeamsApi, TeamsStream> {
  get meta() {
    return {
      id: '39525c14-738f-4db8-b73b-1f0edb36ad7c',
      name: 'teams',
      version: '1.0.0',
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
