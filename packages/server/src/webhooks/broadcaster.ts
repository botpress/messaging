import axios, { AxiosRequestConfig } from 'axios'
import yn from 'yn'

import { ConfigService } from '../config/service'
import { WebhookService } from './service'

export class WebhookBroadcaster {
  constructor(private configService: ConfigService, private webhookService: WebhookService) {}

  public async send(clientId: string, data: any) {
    if (yn(process.env.SPINNED)) {
      await this.callWebhook(process.env.SPINNED_URL!, data)
    } else {
      const webhooks = await this.webhookService.list(clientId)

      for (const webhook of webhooks) {
        await this.callWebhook(webhook.url, data, webhook.token)
      }
    }
  }

  private async callWebhook(url: string, data: any, token?: string) {
    const password = process.env.INTERNAL_PASSWORD || this.configService.current.security?.password
    const config: AxiosRequestConfig = { headers: {} }

    if (password) {
      config.headers.password = password
    }

    if (token) {
      config.headers['x-webhook-token'] = token
    }

    try {
      await axios.post(url, data, config)
    } catch (e) {
      // TODO: maybe we should retry if this call fails
    }
  }
}
