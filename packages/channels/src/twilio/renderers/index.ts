import { TwilioAudioRenderer } from './audio'
import { TwilioCarouselRenderer } from './carousel'
import { TwilioChoicesRenderer } from './choices'
import { TwilioFileRenderer } from './file'
import { TwilioImageRenderer } from './image'
import { TwilioLocationRenderer } from './location'
import { TwilioTextRenderer } from './text'
import { TwilioVideoRenderer } from './video'

export const TwilioRenderers = [
  new TwilioTextRenderer(),
  new TwilioImageRenderer(),
  new TwilioCarouselRenderer(),
  new TwilioChoicesRenderer(),
  new TwilioFileRenderer(),
  new TwilioAudioRenderer(),
  new TwilioVideoRenderer(),
  new TwilioLocationRenderer()
]
