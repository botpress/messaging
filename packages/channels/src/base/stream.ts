import _ from 'lodash'
import { ChannelContext, IndexChoiceOption } from './context'
import { ChannelRenderer } from './renderer'
import { ChannelSender } from './sender'
import { ChannelSendEvent, ChannelService } from './service'

export abstract class ChannelStream<TService extends ChannelService<any, any>> {
  constructor(protected readonly service: TService) {}

  async setup() {
    this.service.on('send', this.handleSend.bind(this))
  }

  protected abstract handleSend({ scope, endpoint, content }: ChannelSendEvent): Promise<void>
}

export abstract class ChannelStreamRenderers<
  TService extends ChannelService<any, any>,
  TContext extends ChannelContext<any>
> extends ChannelStream<TService> {
  abstract get renderers(): ChannelRenderer<ChannelContext<any>>[]
  abstract get senders(): ChannelSender<ChannelContext<any>>[]

  protected async handleSend({ scope, endpoint, content }: ChannelSendEvent) {
    const context = await this.getContext({
      state: this.service.get(scope),
      handlers: 0,
      payload: _.cloneDeep(content),
      ...endpoint
    })

    for (const renderer of this.renderers) {
      if (renderer.handles(context)) {
        try {
          renderer.render(context)
        } catch (e) {
          console.error('Error occurred when rendering a message', e)
        } finally {
          context.handlers++
        }
      }
    }

    for (const sender of this.senders) {
      if (sender.handles(context)) {
        try {
          await sender.send(context)
        } catch (e) {
          console.error('Error occurred when sending a message', e)
        }
      }
    }
  }

  protected abstract getContext(base: ChannelContext<any>): Promise<TContext>

  protected prepareIndexResponse(identity: string, sender: string, options: IndexChoiceOption[]) {
    // TODO: do something here
    // this.cacheIndexResponses.set(this.getIndexCacheKey(identity, sender), options)
  }
}
