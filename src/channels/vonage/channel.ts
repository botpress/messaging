import { Channel, EndpointContent } from '../base/channel'
import { ChannelContext } from '../base/context'
import { VonageConfig } from './config'
import { VonageContext } from './context'

export class VonageChannel extends Channel<VonageConfig, VonageContext> {
  get id() {
    return 'vonage'
  }

  protected async setupConnection() {
    this.logger.info('Vonage setup', this.config.apiKey)
  }

  protected setupRenderers() {
    return []
  }

  protected setupSenders() {
    return []
  }

  protected async map(payload: any): Promise<EndpointContent> {
    return <any>{}
  }

  protected async context(base: ChannelContext<any>): Promise<VonageContext> {
    return <any>[]
  }
}
