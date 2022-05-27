import { Content } from './content'

export interface VoiceContent extends Content {
  type: 'voice'
  audio: string
}
