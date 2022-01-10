import { uuid } from '@botpress/messaging-base'
import { Endpoint } from '@botpress/messaging-channels'
import { Logger, Service } from '@botpress/messaging-engine'
import { validate as uuidValidate } from 'uuid'
import { ClientService } from '../../clients/service'
import { MappingService } from '../../mapping/service'
import { InstanceMessagingService } from '../messaging/service'

const JOIN_KEYWORD = '!join'

export class InstanceSandboxService extends Service {
  private logger = new Logger('Sandbox')

  constructor(
    private clients: ClientService,
    private mapping: MappingService,
    private messaging: InstanceMessagingService
  ) {
    super()
  }

  async setup() {}

  async getClientId(conduitId: uuid, endpoint: Endpoint, content: any): Promise<uuid | undefined> {
    const sandboxmap = await this.mapping.sandboxmap.get(conduitId, endpoint)

    if (sandboxmap) {
      return sandboxmap.clientId
    } else {
      return this.tryJoin(conduitId, endpoint, content)
    }
  }

  async tryJoin(conduitId: uuid, endpoint: Endpoint, content: any): Promise<uuid | undefined> {
    const text: string | undefined = content?.text

    if (text?.trim().startsWith(JOIN_KEYWORD)) {
      const passphrase = text.replace(JOIN_KEYWORD, '').trim()

      return this.tryJoinWithPassphrase(conduitId, endpoint, passphrase)
    } else {
      await this.printAskJoinSandbox(conduitId, endpoint)
    }
  }

  async printAskJoinSandbox(conduitId: uuid, endpoint: Endpoint) {
    await this.messaging.send(conduitId, endpoint, {
      type: 'text',
      text: 'Please join the sandbox by sending : !join your_passphrase'
    })
    this.logger.info('This endpoint is unknown to the sandbox')
  }

  async tryJoinWithPassphrase(conduitId: uuid, endpoint: Endpoint, passphrase: string) {
    this.logger.info('Attempting to join sandbox with passphrase', passphrase)

    const client = uuidValidate(passphrase) ? await this.clients.fetchById(passphrase) : undefined

    if (client) {
      this.logger.info('Joined sandbox!', client.id)

      await this.mapping.sandboxmap.create(conduitId, endpoint, client.id)

      return client.id
    } else {
      await this.printWrongPassphrase(conduitId, endpoint)
    }
  }

  async printWrongPassphrase(conduitId: uuid, endpoint: Endpoint) {
    await this.messaging.send(conduitId, endpoint, {
      type: 'text',
      text: 'Wrong passphrase'
    })
    this.logger.info('Wrong passphrase')
  }
}
