import { Service } from '@botpress/framework'

export class FileService extends Service {
  async setup() {}

  async list(dir: string): Promise<any[]> {
    return []
  }
}
