import { cloneDeep } from 'lodash'
import { WebchatEvent, WebchatEventType } from '../typings'

export const postMessageToParent = (type: WebchatEventType, value: any, chatId: string) => {
  //necessary because of potentially nested mobx proxy object isn't serializable
  value = cloneDeep(value)
  const evt: WebchatEvent = { type, value, chatId }
  window.parent?.postMessage(evt, '*')
}
