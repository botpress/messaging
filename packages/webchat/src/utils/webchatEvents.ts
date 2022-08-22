import { WebchatEvent, WebchatEventType } from '../typings'

export const postMessageToParent = (type: WebchatEventType, value: any, chatId: string) => {
  const evt: WebchatEvent = { type, value, chatId }
  window.parent?.postMessage(evt, '*')
}
