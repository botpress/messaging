import { Service } from '@botpress/framework'
import { mkdir, readFile, unlink, writeFile } from 'fs/promises'
import path from 'path'
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

  async get(filepath: string): Promise<any> {
    const buffer = await readFile(this.paths.absolute(filepath))
    return JSON.parse(buffer.toString())
  }

  async update(filepath: string, content: any) {
    try {
      await mkdir(this.paths.absolute(path.dirname(filepath)))
    } catch {}

    await writeFile(this.paths.absolute(filepath), JSON.stringify(content, undefined, 2))
  }

  async delete(filepath: string) {
    await unlink(this.paths.absolute(filepath))
  }
}
