import { Service } from '@botpress/framework'
import { readFile } from 'fs/promises'
import { PathService } from '../paths/service'

export class FileService extends Service {
  constructor(private paths: PathService) {
    super()
  }

  async setup() {}

  async list(dir: string): Promise<any[]> {
    const filePaths = await this.paths.list(dir)
    return Promise.all(filePaths.map((path) => this.get(path)))
  }

  async get(path: string): Promise<any> {
    const buffer = await readFile(this.paths.absolute(path))
    return buffer.toJSON()
  }
}
