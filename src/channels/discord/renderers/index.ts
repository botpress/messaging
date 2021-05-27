import { DiscordCarouselRenderer } from './carousel'
import { DiscordChoicesRenderer } from './choices'
import { DiscordImageRenderer } from './image'
import { DiscordTextRenderer } from './text'

export const DiscordRenderers = [
  new DiscordTextRenderer(),
  new DiscordImageRenderer(),
  new DiscordCarouselRenderer(),
  new DiscordChoicesRenderer()
]
