import axios, { AxiosRequestConfig } from 'axios'
import yn from 'yn'

import { ConfigService } from '../config/service'
import { Logger } from '../logger/types'
import { WebhookService } from './service'
import { WebhookContent } from './types'

export class WebhookBroadcaster {
  private logger: Logger

  constructor(private configService: ConfigService, private webhookService: WebhookService) {
    this.logger = new Logger('webhook').sub('broadcaster')
  }

  public async send(clientId: string, data: WebhookContent) {
    if (yn(process.env.SPINNED)) {
      await this.callWebhook(clientId, process.env.SPINNED_URL!, data)
    } else {
      const webhooks = await this.webhookService.list(clientId)

      for (const webhook of webhooks) {
        await this.callWebhook(clientId, webhook.url, data, webhook.token)
      }
    }
  }

  private async callWebhook(clientId: string, url: string, data: WebhookContent, token?: string) {
    const password = process.env.INTERNAL_PASSWORD || this.configService.current.security?.password
    const config: AxiosRequestConfig = { headers: {} }

    if (password) {
      config.headers.password = password
    }

    if (token) {
      config.headers['x-webhook-token'] = token
    }

    try {
      this.logger.debug(`Client ID '${clientId}' calling webhook URL '${url}'`)

      await axios.post(url, data, config)
    } catch (e) {
      // TODO: maybe we should retry if this call fails
    }
  }
}
