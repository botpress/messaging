import { Content } from './content'

export interface TextContent extends Content {
  type: 'text'
  text: string
  markdown?: boolean
}
