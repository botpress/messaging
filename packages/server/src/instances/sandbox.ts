import { uuid } from '@botpress/messaging-base'
import { Logger } from '@botpress/messaging-engine'
import { validate as uuidValidate } from 'uuid'
import { EndpointContent } from '../channels/base/conduit'
import { ClientService } from '../clients/service'
import { MappingService } from '../mapping/service'
import { InstanceService } from './service'

const JOIN_KEYWORD = '!join'

export class InstanceSandbox {
  private logger = new Logger('Sandbox')

  constructor(private clients: ClientService, private mapping: MappingService, private instances: InstanceService) {}

  async getClientId(conduitId: uuid, endpoint: EndpointContent): Promise<uuid | undefined> {
    const sandboxmap = await this.mapping.sandboxmap.get(conduitId, endpoint)

    if (sandboxmap) {
      return sandboxmap.clientId
    } else {
      return this.tryJoin(conduitId, endpoint)
    }
  }

  async tryJoin(conduitId: uuid, endpoint: EndpointContent): Promise<uuid | undefined> {
    const text: string | undefined = endpoint.content?.text

    if (text?.trim().startsWith(JOIN_KEYWORD)) {
      const passphrase = text.replace(JOIN_KEYWORD, '').trim()

      return this.tryJoinWithPassphrase(conduitId, endpoint, passphrase)
    } else {
      await this.printAskJoinSandbox(conduitId, endpoint)
    }
  }

  async printAskJoinSandbox(conduitId: uuid, endpoint: EndpointContent) {
    const instance = await this.instances.get(conduitId)

    await instance.sendToEndpoint(endpoint, {
      type: 'text',
      text: 'Please join the sandbox by sending : !join your_passphrase'
    })
    this.logger.info('This endpoint is unknown to the sandbox')
  }

  async tryJoinWithPassphrase(conduitId: uuid, endpoint: EndpointContent, passphrase: string) {
    this.logger.info('Attempting to join sandbox with passphrase', passphrase)

    const client = uuidValidate(passphrase) ? await this.clients.getById(passphrase) : undefined

    if (client) {
      this.logger.info('Joined sandbox!', client.id)

      await this.mapping.sandboxmap.create(conduitId, endpoint, client.id)

      return client.id
    } else {
      await this.printWrongPassphrase(conduitId, endpoint)
    }
  }

  async printWrongPassphrase(conduitId: uuid, endpoint: EndpointContent) {
    const instance = await this.instances.get(conduitId)

    await instance.sendToEndpoint(endpoint, {
      type: 'text',
      text: 'Wrong passphrase'
    })
    this.logger.info('Wrong passphrase')
  }
}
