import { Content } from './content'

export interface AudioContent extends Content {
  type: 'audio'
  audio: string
  title?: string
}
