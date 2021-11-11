import { Message, uuid } from '@botpress/messaging-base'
import ms from 'ms'
import { Service } from '../base/service'
import { ServerCache } from '../caching/cache'
import { CachingService } from '../caching/service'
import { DistributedService } from '../distributed/service'
import { MessageCreatedEvent, MessageEvents } from '../messages/events'
import { MessageService } from '../messages/service'
import { Collector } from './types'

const DEFAULT_COLLECT_TIMEOUT = ms('10s')

export class ConverseService extends Service {
  private collectors!: ServerCache<uuid, Collector[]>
  private incomingIdCache!: ServerCache<uuid, uuid>
  private collectingForMessageCache!: ServerCache<uuid, boolean>
  private handleDistributedMessageCallback!: (message: any) => Promise<void>

  constructor(
    private caching: CachingService,
    private distributed: DistributedService,
    private messages: MessageService
  ) {
    super()
  }

  async setup() {
    this.messages.events.on(MessageEvents.Created, this.handleMessageCreated.bind(this))

    this.collectors = await this.caching.newServerCache('cache_converse_collectors', {})
    this.incomingIdCache = await this.caching.newServerCache('cache_converse_incoming_id')
    this.collectingForMessageCache = await this.caching.newServerCache('cache_converse_collecting_for_message')
    this.handleDistributedMessageCallback = this.handleDistributedMessage.bind(this)
  }

  private async handleMessageCreated({ message }: MessageCreatedEvent) {
    if (message.authorId) {
      // we only collect bot messages
      return
    }

    const incomingId = this.incomingIdCache.get(message.id)
    await this.distributed.publish(`converse/${incomingId}`, {
      cmd: ConverseCmds.Message,
      data: { message, incomingId }
    })
  }

  private async handleDistributedMessage({ cmd, data }: { cmd: ConverseCmds; data: any }) {
    if (cmd === ConverseCmds.Stop) {
      const { conversationId, messageId } = data
      const collectors = this.collectors.get(conversationId) || []
      const childCollectors = collectors.filter((x) => x.incomingId === messageId)

      for (const collector of childCollectors) {
        clearTimeout(collector.timeout!)
        this.removeCollector(collector)
        this.resolveCollect(collector)
      }

      await this.distributed.unsubscribe(`converse/${messageId}`)
    } else if (cmd === ConverseCmds.Message) {
      const { message: rawMessage, incomingId } = data
      const message = { ...rawMessage, sentOn: new Date(rawMessage.sentOn) }
      const collectors = this.collectors.get(message.conversationId) || []

      for (const collector of collectors) {
        if (!incomingId || incomingId === collector.incomingId) {
          collector.messages.push(message)
        }
      }
    }
  }

  setIncomingId(messageId: uuid, incomingId: uuid) {
    this.incomingIdCache.set(messageId, incomingId)
  }

  isCollectingForMessage(messageId: uuid) {
    return !!this.collectingForMessageCache.get(messageId)
  }

  async collect(messageId: uuid, conversationId: uuid, timeout: number): Promise<Message[]> {
    await this.distributed.listen(`converse/${messageId}`, this.handleDistributedMessageCallback)

    const collector = this.addCollector(messageId, conversationId)
    if (timeout !== 0) {
      this.resetCollectorTimeout(collector, timeout || DEFAULT_COLLECT_TIMEOUT)
    }

    this.collectingForMessageCache.set(messageId, true)

    return new Promise<Message[]>((resolve) => {
      collector.resolve = resolve
    })
  }

  async stopCollecting(messageId: uuid, conversationId: uuid) {
    await this.distributed.publish(`converse/${messageId}`, {
      cmd: ConverseCmds.Stop,
      data: { conversationId, messageId }
    })
  }

  private addCollector(messageId: uuid, conversationId: uuid): Collector {
    let collectors = this.collectors.get(conversationId)

    if (!collectors) {
      collectors = []
      this.collectors.set(conversationId, collectors)
    }

    const collector: Collector = {
      incomingId: messageId,
      conversationId,
      messages: []
    }

    collectors.push(collector)

    return collector
  }

  private resolveCollect(collector: Collector) {
    if (collector.resolve) {
      collector.resolve(collector.messages)
      collector.resolve = undefined
    }
  }

  private removeCollector(collector: Collector) {
    const { conversationId } = collector

    const collectors = this.collectors.get(conversationId)!
    const index = collectors.indexOf(collector)
    if (index >= 0) {
      collectors.splice(index, 1)
    }

    if (!collectors.length) {
      this.collectors.del(conversationId)
    }
  }

  private resetCollectorTimeout(collector: Collector, time: number) {
    if (collector.timeout) {
      clearTimeout(collector.timeout)
    }

    collector.timeout = setTimeout(() => {
      this.removeCollector(collector)
      this.resolveCollect(collector)
    }, time)
  }
}

export enum ConverseCmds {
  Message,
  Stop
}
