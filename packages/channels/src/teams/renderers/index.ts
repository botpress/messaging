import { TeamsAudioRenderer } from './audio'
import { TeamsCarouselRenderer } from './carousel'
import { TeamsChoicesRenderer } from './choices'
import { TeamsDropdownRenderer } from './dropdown'
import { TeamsImageRenderer } from './image'
import { TeamsTextRenderer } from './text'
import { TeamsVideoRenderer } from './video'

export const TeamsRenderers = [
  new TeamsTextRenderer(),
  new TeamsImageRenderer(),
  new TeamsCarouselRenderer(),
  new TeamsDropdownRenderer(),
  new TeamsChoicesRenderer(),
  new TeamsAudioRenderer(),
  new TeamsVideoRenderer()
]
