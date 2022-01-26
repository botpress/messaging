import { TelegramCarouselRenderer } from './carousel'
import { TelegramChoicesRenderer } from './choices'
import { TelegramFileRenderer } from './file'
import { TelegramImageRenderer } from './image'
import { TelegramTextRenderer } from './text'

export const TelegramRenderers = [
  new TelegramTextRenderer(),
  new TelegramImageRenderer(),
  new TelegramCarouselRenderer(),
  new TelegramChoicesRenderer(),
  new TelegramFileRenderer()
]
