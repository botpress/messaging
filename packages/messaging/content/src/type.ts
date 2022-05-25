import { AudioContent } from './audio'
import { CardContent } from './card'
import { CarouselContent } from './carousel'
import { FileContent } from './file'
import { ImageContent } from './image'
import { LocationContent } from './location'
import { TextContent } from './text'
import { VideoContent } from './video'
import { VoiceContent } from './voice'

export type ContentType =
  | TextContent
  | ImageContent
  | AudioContent
  | VideoContent
  | CarouselContent
  | CardContent
  | LocationContent
  | FileContent
  | VoiceContent
