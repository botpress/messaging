import { Dispatcher, DistributedService } from '..'
import { Service } from '../base/service'

export class DispatchService extends Service {
  constructor(private distributed: DistributedService) {
    super()
  }

  async setup() {}

  async create<T extends Dispatcher<any>>(name: string, t: new () => T): Promise<T> {
    const dispatcher = new t()
    await dispatcher.setup(name, this.distributed)
    return dispatcher
  }
}
