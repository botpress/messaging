import axios from 'axios'
import { URLSearchParams } from 'url'
import { ChannelTestError } from '../base/channel'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { ChannelTestEvent } from '../base/service'
import { ChannelStream } from '../base/stream'
import { TeamsContext } from './context'
import { TeamsRenderers } from './renderers'
import { TeamsSenders } from './senders'
import { TeamsService } from './service'

export class TeamsStream extends ChannelStream<TeamsService, TeamsContext> {
  get renderers() {
    return [new CardToCarouselRenderer(), ...TeamsRenderers]
  }

  get senders() {
    return TeamsSenders
  }

  async setup() {
    await super.setup()
    this.service.on('test', this.handleTest.bind(this))
  }

  private async handleTest({ scope }: ChannelTestEvent) {
    const { config } = this.service.get(scope)

    try {
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.appId,
        client_secret: config.appPassword,
        tenant_id: config.tenantId,
        scope: 'https://api.botframework.com/.default'
      })
      if (config.tenantId) {
        await axios.post(`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`, params.toString())
      } else {
        await axios.post('https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token', params.toString())
      }
    } catch (e) {
      throw new ChannelTestError(
        'unable to reach teams using the provided app id and app password combination',
        'teams',
        'appPassword'
      )
    }
  }

  protected async getContext(base: ChannelContext<any>): Promise<TeamsContext> {
    return {
      ...base,
      messages: [],
      convoRef: await this.service.getRef(base.scope, base.thread)
    }
  }
}
