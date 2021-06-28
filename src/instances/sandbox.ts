import { validate as uuidValidate } from 'uuid'
import { uuid } from '../base/types'
import { EndpointContent } from '../channels/base/conduit'
import { ClientService } from '../clients/service'
import { Logger } from '../logger/types'
import { MappingService } from '../mapping/service'
import { InstanceService } from './service'

export class InstanceSandbox {
  private logger = new Logger('Sandbox')

  constructor(private clients: ClientService, private mapping: MappingService, private instances: InstanceService) {}

  async getClientId(conduitId: uuid, endpoint: EndpointContent): Promise<uuid | undefined> {
    const instance = await this.instances.get(conduitId)

    const sandboxmap = await this.mapping.sandboxmap.get(
      conduitId,
      endpoint.identity || '*',
      endpoint.sender || '*',
      endpoint.thread || '*'
    )

    if (sandboxmap) {
      return sandboxmap.clientId
    } else if (endpoint.content?.text?.startsWith('!join')) {
      const text = endpoint.content.text as string
      const passphrase = text.replace('!join ', '')
      this.logger.info('Attempting to join sandbox with passphrase', passphrase)

      if (uuidValidate(passphrase)) {
        const client = await this.clients.getById(passphrase)
        if (client) {
          this.logger.info('Joined sandbox!', client.id)

          await this.mapping.sandboxmap.create(
            conduitId,
            endpoint.identity || '*',
            endpoint.sender || '*',
            endpoint.thread || '*',
            client.id
          )

          return client.id
        } else {
          await instance.sendToEndpoint(endpoint, {
            type: 'text',
            text: 'Sandbox client not found'
          })
          this.logger.info('Sandbox client not found')
          return undefined
        }
      } else {
        await instance.sendToEndpoint(endpoint, {
          type: 'text',
          text: 'Wrong passphrase'
        })
        this.logger.info('Wrong passphrase')
        return undefined
      }
    } else {
      await instance.sendToEndpoint(endpoint, {
        type: 'text',
        text: 'Please join the sandbox by sending : !join your_passphrase'
      })
      this.logger.info('This endpoint is unknown to the sandbox')
      return undefined
    }
  }
}
