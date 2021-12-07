import { ChannelSendEvent } from '../base/service'
import { ChannelStream } from '../base/stream'
import { VonageService } from './service'

export class VonageStream extends ChannelStream<VonageService> {
  protected async handleSend({ scope, endpoint, content }: ChannelSendEvent) {
    const { vonage, config } = this.service.get(scope)

    const message = {
      content: {
        type: 'text',
        text: content.text
      }
    }

    await new Promise((resolve) => {
      vonage.channel.send(
        { type: 'whatsapp', number: endpoint.sender },
        {
          type: 'whatsapp',
          number: endpoint.identity
        },
        message as any,
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

              console.error(`${errBody.title}: ${errBody.detail} ${reasons}${errBody.type || ''}`)
              // eslint-disable-next-line eqeqeq
            } else if ((<any>err).statusCode == '429') {
              console.error(undefined, 'HTTPError (429): Too Many Requests')
            } else {
              console.error(undefined, 'UnknownError', err)
            }
          } else {
            resolve(data)
          }
        }
      )
    })

    if (config.useTestingApi) {
      // sandbox is limited to 1 msg / sec
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}
