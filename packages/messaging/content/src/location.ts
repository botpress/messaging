import { Content } from './content'

export interface LocationContent extends Content {
  type: 'location'
  latitude: number
  longitude: number
  address?: string
  title?: string
}
