import { DistributedSubservice } from '../base/subservice'

export class LocalSubservice implements DistributedSubservice {
  async setup() {}

  async destroy() {}

  async listen(channel: string, callback: (message: any) => Promise<void>) {}

  async send(channel: string, message: any) {}
}
