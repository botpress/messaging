import yn from 'yn'

import { PostService } from '../post/service'
import { WebhookService } from './service'
import { WebhookContent } from './types'

export class WebhookBroadcaster {
  constructor(private postService: PostService, private webhookService: WebhookService) {}

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
