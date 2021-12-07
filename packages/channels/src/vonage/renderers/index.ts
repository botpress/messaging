import { VonageAudioRenderer } from './audio'
import { VonageCarouselRenderer } from './carousel'
import { VonageChoicesRenderer } from './choices'
import { VonageFileRenderer } from './file'
import { VonageImageRenderer } from './image'
import { VonageLocationRenderer } from './location'
import { VonageTemplateRenderer } from './template'
import { VonageMediaTemplateRenderer } from './template-media'
import { VonageTextRenderer } from './text'
import { VonageVideoRenderer } from './video'

export const VonageRenderers = [
  new VonageTextRenderer(),
  new VonageImageRenderer(),
  new VonageLocationRenderer(),
  new VonageCarouselRenderer(),
  new VonageAudioRenderer(),
  new VonageVideoRenderer(),
  new VonageTemplateRenderer(),
  new VonageMediaTemplateRenderer(),
  new VonageChoicesRenderer(),
  new VonageFileRenderer()
]
