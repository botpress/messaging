import { TelegramCarouselRenderer } from './carousel'
import { TelegramChoicesRenderer } from './choices'
import { TelegramImageRenderer } from './image'
import { TelegramTextRenderer } from './text'

export const TelegramRenderers = [
  new TelegramTextRenderer(),
  new TelegramImageRenderer(),
  new TelegramCarouselRenderer(),
  new TelegramChoicesRenderer()
]
