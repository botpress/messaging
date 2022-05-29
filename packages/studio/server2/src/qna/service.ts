import { Service } from '@botpress/framework'
import { FileService } from '../files/service'

export class QnaService extends Service {
  constructor(private files: FileService) {
    super()
  }

  async setup() {}

  async list() {
    const qnas = await this.files.list('qna')
    return qnas.map((x) => x.content)
  }
}
