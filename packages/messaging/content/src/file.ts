import { Content } from './content'

export interface FileContent extends Content {
  type: 'file'
  file: string
  title?: string
}
