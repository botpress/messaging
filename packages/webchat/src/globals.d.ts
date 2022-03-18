import { MessagingSocket } from '@botpress/messaging-socket'

declare module '*.scss'

declare global {
  interface Window {
    websocket: MessagingSocket
  }
}
