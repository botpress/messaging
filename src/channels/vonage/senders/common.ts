import { CommonSender } from '../../base/senders/common'
import { VonageContext } from '../context'

export class VonageCommonSender extends CommonSender {
  async send(context: VonageContext) {
    for (const message of context.messages) {
      await new Promise((resolve) => {
        context.client.channel.send(
          { type: 'whatsapp', number: context.foreignUserId! },
          {
            type: 'whatsapp',
            number: context.foreignAppId!
          },
          message,
          (err, data) => {
            if (err) {
              const errBody = (err as any).body
              let reasons: string = ''
              if (errBody) {
                if (errBody.invalid_parameters) {
                  for (const param of errBody.invalid_parameters) {
                    reasons += `${param.reason}: ${param.name}; `
                  }
                }

                context.logger.error(`${errBody.title}: ${errBody.detail} ${reasons}${errBody.type}`)
              } else if ((<any>err).statusCode === '429') {
                context.logger.error('HTTPError (429): Too Many Requests')
              } else {
                context.logger.error('UnknownError', err)
              }
            } else {
              resolve(data)
            }
          }
        )
      })

      if (context.isSandbox) {
        // sandbox is limited to 1 msg / sec
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }
}
