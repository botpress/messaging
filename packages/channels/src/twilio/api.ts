import express, { Response } from 'express'
// @ts-ignore
import extName from 'ext-name'
import path from 'path'
import { validateRequest } from 'twilio'
import urlUtil from 'url'
import yn from 'yn'
import { ChannelApi, ChannelApiManager, ChannelApiRequest } from '../base/api'
import { TwilioService } from './service'

export class TwilioApi extends ChannelApi<TwilioService> {
  async setup(router: ChannelApiManager) {
    router.use('/twilio', express.urlencoded({ extended: true }))
    router.post('/twilio', this.handleRequest.bind(this))
  }

  private async handleRequest(req: ChannelApiRequest, res: Response) {
    const { config } = this.service.get(req.scope)

    const signature = req.headers['x-twilio-signature'] as string
    const webhookUrl = await this.urlCallback!(req.scope)

    if (validateRequest(config.authToken, signature, webhookUrl, req.body) || yn(process.env.TWILIO_TESTING)) {
      await this.receive(req.scope, req.body)
      res.sendStatus(204)
    } else {
      res.sendStatus(401)
    }
  }

  private async receive(scope: string, body: any) {
    const { NumMedia, To: botPhoneNumber, From: userPhoneNumber } = body
    const endpoint = { identity: botPhoneNumber, sender: userPhoneNumber, thread: '*' }

    for (let i = 0; i < NumMedia; i++) {
      const contentUrl = body[`MediaUrl${i}`]
      const contentType = body[`MediaContentType${i}`]
      const extension = extName.mime(contentType)[0].ext
      const mediaSid = path.basename(urlUtil.parse(contentUrl).pathname as string)
      const name = `${mediaSid}.${extension}`

      await this.service.receive(scope, endpoint, {
        type: this.mapMimeTypeToStandardType(contentType),
        url: contentUrl,
        title: name
      })
    }

    if (body.Body.length > 0) {
      const index = Number(body.Body)
      const content = this.service.handleIndexResponse(scope, index, botPhoneNumber, userPhoneNumber) || {
        type: 'text',
        text: body.Body
      }

      await this.service.receive(scope, endpoint, content)
    }
  }
}
