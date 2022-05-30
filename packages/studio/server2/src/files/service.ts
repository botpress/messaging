import { Service } from '@botpress/framework'
import { readFile, writeFile } from 'fs/promises'
import { PathService } from '../paths/service'
import { FileData } from './types'

export class FileService extends Service {
  constructor(private paths: PathService) {
    super()
  }

  async setup() {}

  async list(dir: string): Promise<FileData[]> {
    const paths = await this.paths.listFiles(dir)
    const contents = await Promise.all(paths.map((path) => this.get(path)))

    return paths.map((path, i) => ({ path, content: contents[i] }))
  }

  async get(path: string): Promise<any> {
    const buffer = await readFile(this.paths.absolute(path))
    return JSON.parse(buffer.toString())
  }

  async update(path: string, content: any) {
    await writeFile(this.paths.absolute(path), JSON.stringify(content, undefined, 2))
  }
}
