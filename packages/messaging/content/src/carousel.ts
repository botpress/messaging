import { CardContent } from './card'
import { Content } from './content'

export interface CarouselContent extends Content {
  type: 'carousel'
  items: CardContent[]
}
