import { Channel } from '../base/channel'
import { TeamsApi } from './api'
import { TeamsConfig } from './config'
import { TeamsService } from './service'
import { TeamsStream } from './stream'

export class TeamsChannel extends Channel<TeamsConfig, TeamsService, TeamsApi, TeamsStream> {
  constructor() {
    const service = new TeamsService()
    super(service, new TeamsApi(service), new TeamsStream(service))
  }
}
