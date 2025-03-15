import { WhatsappAudioRenderer } from './audio'
import { WhatsappCarouselRenderer } from './carousel'
import { WhatsappChoicesRenderer } from './choices'
import { WhatsappFileRenderer } from './file'
import { WhatsappImageRenderer } from './image'
import { WhatsappLocationRenderer } from './location'
import { WhatsappTextRenderer } from './text'
import { WhatsappVideoRenderer } from './video'

export const WhatsappRenderers = [
  new WhatsappTextRenderer(),
  new WhatsappImageRenderer(),
  new WhatsappCarouselRenderer(),
  new WhatsappChoicesRenderer(),
  new WhatsappFileRenderer(),
  new WhatsappAudioRenderer(),
  new WhatsappVideoRenderer(),
  new WhatsappLocationRenderer()
]
