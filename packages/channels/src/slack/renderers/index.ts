import { SlackCarouselRenderer } from './carousel'
import { SlackChoicesRenderer } from './choices'
import { SlackDropdownRenderer } from './dropdown'
import { SlackImageRenderer } from './image'
import { SlackTextRenderer } from './text'

export const SlackRenderers = [
  new SlackDropdownRenderer(),
  new SlackTextRenderer(),
  new SlackImageRenderer(),
  new SlackCarouselRenderer(),
  new SlackChoicesRenderer()
]
