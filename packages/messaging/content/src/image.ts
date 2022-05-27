import { Content } from './content'

export interface ImageContent extends Content {
  type: 'image'
  image: string
  title?: string
}
