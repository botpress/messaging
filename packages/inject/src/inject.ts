import { Config, WebchatEvent, WebchatEventType } from '../../webchat/src/typings'

import './inject.css'

interface WebchatRef {
  iframeWindow: Window
  eventListener: {
    handler: WebchatEventHandler
    topics: WebchatEventHandlerTopics
  }
}

type WebchatEventHandler = (evnt: WebchatEvent) => void
type WebchatEventHandlerTopics = WebchatEventType[] | ['*']

// full backward compatibility
const DEFAULT_CHAT_ID = 'bp-web-widget'
const DEFAULT_IFRAME_ID = 'bp-widget'

const CHAT_REFS: { [chatId: string]: WebchatRef } = {}

function _getContainerId(chatId?: string): string {
  return chatId ? `${chatId}-container` : DEFAULT_CHAT_ID
}

function _getIframeId(chatId: string): string {
  return chatId || DEFAULT_IFRAME_ID
}

function _injectDOMElement(
  tagName: keyof HTMLElementTagNameMap,
  selector: string,
  options: { [key: string]: string } = {}
): HTMLElement | void {
  const element = document.createElement(tagName)
  // @ts-ignore
  Object.entries(options).forEach(([attrName, attrValue]) => (element[attrName] = attrValue))

  const parent = document.querySelector(selector)
  if (!parent) {
    throw new Error(`No element correspond to ${selector}`)
  }
  parent.appendChild(element)
  return element
}

function _generateIFrameHTML(host: string, config: Config) {
  const keyStorage = `bp-chat-key-${config.clientId}`
  let encryptionKey = localStorage.getItem(keyStorage)

  if (!encryptionKey) {
    encryptionKey = _generateRandomString(32)
    localStorage.setItem(keyStorage, encryptionKey)
  }

  const options = encodeURIComponent(JSON.stringify({ config: { ...config, encryptionKey } }))
  const title = encodeURIComponent(config.botConversationDescription || config.botName || 'Chatbot')
  const iframeSrc = host + '/index.html?options=' + options
  const iframeId = _getIframeId(config.chatId)
  return `<iframe id="${iframeId}" title="${title}" frameborder="0" src="${iframeSrc}" class="bp-widget-web"/>`
}

function _generateRandomString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  let str = ''
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return str
}

function _makeChatRefProxy(chatId: string, target: Partial<WebchatRef>): WebchatRef {
  const chatRefHandler: ProxyHandler<WebchatRef> = {
    get(target, prop: keyof WebchatRef) {
      if (target[prop]) {
        return target[prop]
      }

      if (prop === 'iframeWindow') {
        return () => {
          console.warn(
            `No webchat with id ${chatId} has been initialized. \n Please use window.botpressWebChat.init first.`
          )
        }
      } else if (prop === 'eventListener') {
        return {
          handler: () => {},
          types: []
        }
      }
    },
    set(target, prop: keyof WebchatRef, value) {
      target[prop] = value
      return true
    }
  }
  return new Proxy<Partial<WebchatRef>>(target, chatRefHandler) as WebchatRef
}

function _getChatRef(chatId?: string) {
  chatId = chatId || DEFAULT_CHAT_ID
  return CHAT_REFS[chatId]
}

function _getIframeElement(containerId: string, iframeId: string): HTMLIFrameElement {
  return document.querySelector(`#${containerId} #${iframeId}`) as HTMLIFrameElement
}

function sendEvent(payload: any, chatId?: string) {
  const chatRef = _getChatRef(chatId)
  chatRef.iframeWindow.postMessage({ action: 'event', payload }, '*')
}

function sendPayload(payload: any, chatId?: string) {
  const chatRef = _getChatRef(chatId)
  chatRef.iframeWindow.postMessage({ action: 'sendPayload', payload }, '*')
}

function configure(payload: Config, chatId?: string) {
  const chatRef = _getChatRef(chatId)
  chatRef.iframeWindow.postMessage({ action: 'configure', payload }, '*')
}

function mergeConfig(payload: Partial<Config>, chatId?: string) {
  const chatRef = _getChatRef(chatId)
  chatRef.iframeWindow.postMessage({ action: 'mergeConfig', payload }, '*')
}

function onEvent(handler: WebchatEventHandler, topics: WebchatEventHandlerTopics = [], chatId?: string) {
  if (typeof handler !== 'function') {
    throw new Error('EventHandler is not a function, please provide a function')
  }
  if (!Array.isArray(topics)) {
    throw new Error('Topics should be an array of supported event types')
  }

  chatId = chatId || DEFAULT_CHAT_ID
  const partialChatRef: Partial<WebchatRef> = { eventListener: { handler, topics } }

  if (CHAT_REFS[chatId]) {
    Object.assign(CHAT_REFS[chatId], partialChatRef)
  } else {
    CHAT_REFS[chatId] = _makeChatRefProxy(chatId, partialChatRef)
  }
}

/**
 *
 * @param {Config} config Configuration object you want to apply to your webchat instance
 * @param {string} targetSelector css selector under which you want your webchat to be rendered
 */
function init(config: Config, targetSelector: string) {
  targetSelector = targetSelector || 'body'
  config.chatId = config.chatId || DEFAULT_CHAT_ID
  const host = config.hostUrl || ''

  const cssHref = `${host}/inject.css`
  _injectDOMElement('link', 'head', { rel: 'stylesheet', href: cssHref })

  const iframeHTML = _generateIFrameHTML(host, config)

  const containerId = _getContainerId(config.chatId)
  const iframeId = _getIframeId(config.chatId)
  _injectDOMElement('div', targetSelector, { id: containerId, innerHTML: iframeHTML })

  const iframeRef = _getIframeElement(containerId, iframeId)
  const partialChatRef: Partial<WebchatRef> = { iframeWindow: iframeRef.contentWindow! }

  if (CHAT_REFS[config.chatId]) {
    Object.assign(CHAT_REFS[config.chatId], partialChatRef)
  } else {
    CHAT_REFS[config.chatId] = _makeChatRefProxy(config.chatId, partialChatRef)
  }
}

function isWebchatEvent(data: any): data is WebchatEvent {
  return data && typeof data.type === 'string' && typeof data.chatId === 'string'
}

window.addEventListener('message', function ({ data }) {
  if (!isWebchatEvent(data)) {
    return
  }

  if (data.type === 'UI.RESIZE') {
    const width = typeof data.value === 'number' ? data.value + 'px' : data.value
    const iframeElement = _getIframeElement(_getContainerId(data.chatId), _getIframeId(data.chatId))
    iframeElement.style.width = width
  }
  if (data.type === 'UI.SET-CLASS') {
    const iframeElement = _getIframeElement(_getContainerId(data.chatId), _getIframeId(data.chatId))
    iframeElement.setAttribute('class', data.value)
  }

  const chatRef = _getChatRef(data.chatId)
  const shouldFireEvent = chatRef && chatRef.eventListener.topics.some((t) => t === '*' || t === data.type)
  if (shouldFireEvent) {
    chatRef.eventListener.handler(data)
  }
})

window.botpressWebChat = {
  init,
  configure,
  sendEvent,
  mergeConfig,
  sendPayload,
  onEvent
}

export { isWebchatEvent }
