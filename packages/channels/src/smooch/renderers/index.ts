import { SmoochAudioRenderer } from './audio'
import { SmoochCarouselRenderer } from './carousel'
import { SmoochChoicesRenderer } from './choices'
import { SmoochFileRenderer } from './file'
import { SmoochImageRenderer } from './image'
import { SmoochLocationRenderer } from './location'
import { SmoochTextRenderer } from './text'
import { SmoochVideoRenderer } from './video'

export const SmoochRenderers = [
  new SmoochTextRenderer(),
  new SmoochImageRenderer(),
  new SmoochChoicesRenderer(),
  new SmoochCarouselRenderer(),
  new SmoochFileRenderer(),
  new SmoochAudioRenderer(),
  new SmoochVideoRenderer(),
  new SmoochLocationRenderer()
]
