import { MessengerAudioRenderer } from './audio'
import { MessengerCarouselRenderer } from './carousel'
import { MessengerChoicesRenderer } from './choices'
import { MessengerFileRenderer } from './file'
import { MessengerImageRenderer } from './image'
import { MessengerLocationRenderer } from './location'
import { MessengerTextRenderer } from './text'
import { MessengerVideoRenderer } from './video'

export const MessengerRenderers = [
  new MessengerTextRenderer(),
  new MessengerImageRenderer(),
  new MessengerCarouselRenderer(),
  new MessengerChoicesRenderer(),
  new MessengerFileRenderer(),
  new MessengerAudioRenderer(),
  new MessengerVideoRenderer(),
  new MessengerLocationRenderer()
]
