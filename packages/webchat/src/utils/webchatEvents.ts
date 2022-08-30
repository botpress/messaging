import cloneDeep from 'lodash/cloneDeep'
import { WebchatEvent, WebchatEventType } from '../typings'

export const postMessageToParent = (type: WebchatEventType, value: any, chatId: string) => {
  //cloneDeep necessary because of potentially nested mobx proxy object isn't serializable
  const evt: WebchatEvent = { type, value: cloneDeep(value), chatId }
  window.parent?.postMessage(evt, '*')
}
