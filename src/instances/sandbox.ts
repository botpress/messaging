import { uuid } from '../base/types'
import { Endpoint } from '../mapping/types'

export class InstanceSandbox {
  async getClientId(endpoint: Endpoint): Promise<uuid> {
    /*
    const provider = await this.app.providers.getByName(this.providerName)
    const conduit = await this.app.conduits.getByProviderAndChannel(provider!.id, this.channel.id)

    const sandboxmap = await this.app.mapping.sandboxmap.get(
      conduit!.id,
      endpoint.identity || '*',
      endpoint.sender || '*',
      endpoint.thread || '*'
    )

    if (sandboxmap) {
      clientId = sandboxmap.clientId
    } else if (endpoint.content?.text?.startsWith('!join')) {
      const text = endpoint.content.text as string
      const passphrase = text.replace('!join ', '')
      this.logger.info('Attempting to join sandbox with passphrase', passphrase)

      if (uuidValidate(passphrase)) {
        const client = await this.app.clients.getById(passphrase)
        if (client) {
          this.logger.info('Joined sandbox!', client.id)

          await this.app.mapping.sandboxmap.create(
            conduit!.id,
            endpoint.identity || '*',
            endpoint.sender || '*',
            endpoint.thread || '*',
            client.id
          )

          clientId = client.id
        } else {
          await this.sendToEndpoint(endpoint, {
            type: 'text',
            text: 'Sandbox client not found'
          })
          this.logger.info('Sandbox client not found')
          return
        }
      } else {
        await this.sendToEndpoint(endpoint, {
          type: 'text',
          text: 'Wrong passphrase'
        })
        this.logger.info('Wrong passphrase')
        return
      }
    } else {
      await this.sendToEndpoint(endpoint, {
        type: 'text',
        text: 'Please join the sandbox by sending : !join your_passphrase'
      })
      this.logger.info('This endpoint is unknown to the sandbox')
      return
    }
    */
    return ''
  }
}
