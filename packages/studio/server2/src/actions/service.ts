import { Service } from '@botpress/framework'
import { PathService } from '../paths/service'

export class ActionService extends Service {
  constructor(private paths: PathService) {
    super()
  }

  async setup() {}

  async list() {
    const actions = await this.paths.listFilesRecursive('actions')

    return actions.map((x) => ({
      name: x.replace('actions/', '').replace('.js', ''),
      legacy: true,
      scope: 'bot'
    }))
  }
}
