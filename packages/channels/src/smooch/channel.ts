import { Channel } from '../base/channel'
import { SmoochApi } from './api'
import { SmoochConfig } from './config'
import { SmoochService } from './service'
import { SmoochStream } from './stream'

export class SmoochChannel extends Channel<SmoochConfig, SmoochService, SmoochApi, SmoochStream> {
  constructor() {
    const service = new SmoochService()
    super(service, new SmoochApi(service), new SmoochStream(service))
  }
}
