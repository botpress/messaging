import { VonageCarouselRenderer } from './carousel'
import { VonageChoicesRenderer } from './choices'
import { VonageImageRenderer } from './image'
import { VonageTextRenderer } from './text'

export const VonageRenderers = [
  new VonageTextRenderer(),
  new VonageImageRenderer(),
  new VonageChoicesRenderer(),
  new VonageCarouselRenderer()
]
