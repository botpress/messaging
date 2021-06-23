import { BotFrameworkAdapter, ConversationReference, TurnContext } from 'botbuilder'
import _ from 'lodash'
import LRU from 'lru-cache'
import { uuid } from '../../base/types'
import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TeamsConfig } from './config'
import { TeamsContext } from './context'
import { TeamsRenderers } from './renderers'
import { TeamsSenders } from './senders'

export class TeamsConduit extends ConduitInstance<TeamsConfig, TeamsContext> {
  public adapter!: BotFrameworkAdapter
  private convoRefs!: LRU<string, Partial<ConversationReference>>

  protected async setupConnection() {
    this.adapter = new BotFrameworkAdapter({
      appId: this.config.appId,
      appPassword: this.config.appPassword,
      channelAuthTenant: this.config.tenantId
    })

    this.convoRefs = this.app.caching.newLRU()
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...TeamsRenderers]
  }

  protected setupSenders() {
    return TeamsSenders
  }

  protected async map(payload: TurnContext): Promise<EndpointContent> {
    const { activity } = payload
    const convoRef = TurnContext.getConversationReference(activity)

    await this.setConvoRef(convoRef.conversation!.id, convoRef)

    return {
      content: { type: 'text', text: activity.value?.text || activity.text },
      sender: activity.from.id,
      thread: convoRef.conversation!.id
    }
  }

  protected async context(base: ChannelContext<any>): Promise<TeamsContext> {
    return {
      ...base,
      client: this.adapter,
      messages: [],
      convoRef: await this.getConvoRef(base.thread!)
    }
  }

  private async getConvoRef(threadId: string): Promise<Partial<ConversationReference>> {
    let convoRef = this.convoRefs.get(threadId)
    if (convoRef) {
      return convoRef
    }

    // TODO: fix this clientId doesn't work in sandbox
    convoRef = await this.app.kvs.get(this.clientId!, threadId)
    this.convoRefs.set(threadId, convoRef!)
    return convoRef!
  }

  private async setConvoRef(threadId: string, convoRef: Partial<ConversationReference>): Promise<void> {
    if (this.convoRefs.get(threadId)) {
      return
    }

    this.convoRefs.set(threadId, convoRef)
    // TODO: fix this clientId doesn't work in sandbox
    return this.app.kvs.set(this.clientId!, threadId, convoRef)
  }
}
