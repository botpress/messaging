import _ from 'lodash'
import { ChannelContext } from './context'
import { ChannelRenderer } from './renderer'
import { ChannelSender } from './sender'
import { ChannelSendEvent, ChannelService } from './service'

export abstract class ChannelStream<TService extends ChannelService<any, any>, TContext extends ChannelContext<any>> {
  abstract get renderers(): ChannelRenderer<ChannelContext<any>>[]
  abstract get senders(): ChannelSender<ChannelContext<any>>[]

  constructor(protected readonly service: TService) {}

  async setup() {
    this.service.on('send', this.handleSend.bind(this))
  }

  protected async handleSend({ scope, endpoint, content }: ChannelSendEvent) {
    await this.service.require(scope)

    const context = await this.getContext({
      scope,
      state: this.service.get(scope),
      handlers: 0,
      payload: _.cloneDeep(content),
      logger: this.service.logger,
      ...endpoint
    })

    for (const renderer of this.renderers) {
      if (renderer.handles(context)) {
        try {
          renderer.render(context)
        } catch (e) {
          this.service.logger?.error(e, 'Error occurred when rendering a message')
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
          this.service.logger?.error(e, 'Error occurred when sending a message')
        }
      }
    }
  }

  protected abstract getContext(base: ChannelContext<any>): Promise<TContext>
}
