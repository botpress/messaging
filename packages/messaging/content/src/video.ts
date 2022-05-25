import { Content } from './content'

export interface VideoContent extends Content {
  type: 'video'
  video: string
  title?: string
}
