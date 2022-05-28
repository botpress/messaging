import { Service } from '@botpress/framework'
import { readdir } from 'fs/promises'
import path from 'path'

export class PathService extends Service {
  async setup() {
    console.log('data path', process.env.DATA_PATH)
  }

  async list(dir: string): Promise<string[]> {
    const paths = await readdir(this.absolute(dir))
    return paths.map((x) => path.join(dir, x))
  }

  absolute(dir: string): string {
    return path.join(process.env.DATA_PATH || '', dir)
  }
}
