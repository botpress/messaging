import { Router } from 'express'
import { ChannelConfig } from './config'

export abstract class Channel {
  abstract get id(): string

  abstract setup(config: ChannelConfig, router: Router): void

  abstract send(conversationId: string, payload: any): Promise<void>
}
