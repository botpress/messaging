import { SlackCarouselRenderer } from './carousel'
import { SlackChoicesRenderer } from './choices'
import { SlackFeedbackRenderer } from './feedback'
import { SlackImageRenderer } from './image'
import { SlackTextRenderer } from './text'

export const SlackRenderers = [
  new SlackTextRenderer(),
  new SlackImageRenderer(),
  new SlackCarouselRenderer(),
  new SlackChoicesRenderer(),
  new SlackFeedbackRenderer()
]
