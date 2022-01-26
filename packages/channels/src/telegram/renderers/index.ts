import { TelegramAudioRenderer } from './audio'
import { TelegramCarouselRenderer } from './carousel'
import { TelegramChoicesRenderer } from './choices'
import { TelegramFileRenderer } from './file'
import { TelegramImageRenderer } from './image'
import { TelegramLocationRenderer } from './location'
import { TelegramTextRenderer } from './text'
import { TelegramVideoRenderer } from './video'

export const TelegramRenderers = [
  new TelegramTextRenderer(),
  new TelegramImageRenderer(),
  new TelegramCarouselRenderer(),
  new TelegramChoicesRenderer(),
  new TelegramFileRenderer(),
  new TelegramAudioRenderer(),
  new TelegramVideoRenderer(),
  new TelegramLocationRenderer()
]
