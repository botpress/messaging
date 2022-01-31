import { SlackAudioRenderer } from './audio'
import { SlackCarouselRenderer } from './carousel'
import { SlackChoicesRenderer } from './choices'
import { SlackDropdownRenderer } from './dropdown'
import { SlackFileRenderer } from './file'
import { SlackImageRenderer } from './image'
import { SlackLocationRenderer } from './location'
import { SlackTextRenderer } from './text'
import { SlackVideoRenderer } from './video'

export const SlackRenderers = [
  new SlackDropdownRenderer(),
  new SlackTextRenderer(),
  new SlackImageRenderer(),
  new SlackCarouselRenderer(),
  new SlackChoicesRenderer(),
  new SlackFileRenderer(),
  new SlackAudioRenderer(),
  new SlackVideoRenderer(),
  new SlackLocationRenderer()
]
