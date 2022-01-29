import { MessengerCarouselRenderer } from './carousel'
import { MessengerChoicesRenderer } from './choices'
import { MessengerImageRenderer } from './image'
import { MessengerTextRenderer } from './text'

export const MessengerRenderers = [
  new MessengerTextRenderer(),
  new MessengerImageRenderer(),
  new MessengerCarouselRenderer(),
  new MessengerChoicesRenderer()
]
