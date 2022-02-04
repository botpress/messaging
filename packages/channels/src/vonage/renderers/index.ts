import { VonageAudioRenderer } from './audio'
import { VonageCarouselRenderer } from './carousel'
import { VonageChoicesRenderer } from './choices'
import { VonageFileRenderer } from './file'
import { VonageImageRenderer } from './image'
import { VonageTextRenderer } from './text'
import { VonageVideoRenderer } from './video'

export const VonageRenderers = [
  new VonageTextRenderer(),
  new VonageImageRenderer(),
  new VonageChoicesRenderer(),
  new VonageCarouselRenderer(),
  new VonageFileRenderer(),
  new VonageAudioRenderer(),
  new VonageVideoRenderer()
]
