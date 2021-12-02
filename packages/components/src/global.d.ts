import { StudioConnector } from './typings'

declare global {
  export interface Window {
    botpress?: StudioConnector
  }
}
