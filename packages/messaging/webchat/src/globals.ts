import { MessagingSocket } from '@botpress/messaging-socket'

declare global {
  interface Window {
    websocket: MessagingSocket
  }
}

declare module '*.scss'
