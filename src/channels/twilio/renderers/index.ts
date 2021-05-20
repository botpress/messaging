import { TwilioCarouselRenderer } from './carousel'
import { TwilioChoicesRenderer } from './choices'
import { TwilioImageRenderer } from './image'
import { TwilioTextRenderer } from './text'

export const TwilioRenderers = [
  new TwilioTextRenderer(),
  new TwilioImageRenderer(),
  new TwilioCarouselRenderer(),
  new TwilioChoicesRenderer()
]
