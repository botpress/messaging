import yn from 'yn'

import { ConfigService } from '../config/service'
import { PostService } from '../post/service'
import { WebhookService } from './service'
import { WebhookContent } from './types'

export class WebhookBroadcaster {
  private postService: PostService

  constructor(private configService: ConfigService, private webhookService: WebhookService) {
    this.postService = new PostService(this.configService)
  }

  public async send(clientId: string, data: WebhookContent) {
    if (yn(process.env.SPINNED)) {
      return this.postService.send(process.env.SPINNED_URL!, data)
    } else {
      const webhooks = await this.webhookService.list(clientId)

      for (const webhook of webhooks) {
        await this.postService.send(webhook.url, data, { 'x-webhook-token': webhook.token })
      }
    }
  }
}
