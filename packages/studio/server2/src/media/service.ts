import { Service } from '@botpress/framework'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import { PathService } from '../paths/service'

export class MediaService extends Service {
  constructor(private paths: PathService) {
    super()
  }

  async setup() {}

  async get(id: string) {
    const filepath = `/media/${id}`

    return readFile(this.paths.absolute(filepath))
  }

  async save(content: Buffer, ext?: string) {
    const id = uuidv4()
    const filepath = `/media/${id}${ext || '.bin'}`

    try {
      await mkdir(this.paths.absolute(path.dirname(filepath)))
    } catch {}

    await writeFile(this.paths.absolute(filepath), content)

    return filepath
  }
}
