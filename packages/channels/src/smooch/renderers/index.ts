import { SmoochCarouselRenderer } from './carousel'
import { SmoochChoicesRenderer } from './choices'
import { SmoochImageRenderer } from './image'
import { SmoochTextRenderer } from './text'

export const SmoochRenderers = [
  new SmoochTextRenderer(),
  new SmoochImageRenderer(),
  new SmoochChoicesRenderer(),
  new SmoochCarouselRenderer()
]
