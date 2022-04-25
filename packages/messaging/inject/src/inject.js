require('./inject.css')

// full backward compatibility
const DEFAULT_CHAT_ID = 'bp-web-widget'
const DEFAULT_IFRAME_ID = 'bp-widget'
const DEFAULT_IFRAME_CLASS = 'bp-widget-web'

function _getContainerId(chatId) {
  return chatId ? chatId + '-container' : DEFAULT_CHAT_ID
}

function _getIframeId(chatId) {
  return chatId || DEFAULT_IFRAME_ID
}

function _injectDOMElement(tagName, selector, options) {
  const element = document.createElement(tagName)
  if (options) {
    Object.keys(options).forEach(function (key) {
      element[key] = options[key]
    })
  }
  document.querySelector(selector).appendChild(element)
  return element
}

function _generateIFrameHTML(host, config) {
  const keyStorage = `bp-chat-key-${config.clientId}`
  let encryptionKey = localStorage.getItem(keyStorage)

  if (!encryptionKey) {
    encryptionKey = _generateRandomString(32)
    localStorage.setItem(keyStorage, encryptionKey)
  }

  const options = encodeURIComponent(JSON.stringify({ config: { ...config, encryptionKey } }))
  const title = config.botConvoDescription || config.botName || config.botId
  const iframeSrc = host + '/index.html?options=' + options
  const iframeId = _getIframeId(config.chatId)
  return (
    '<iframe id="' +
    iframeId +
    '" title="' +
    encodeURIComponent(title) +
    '" frameborder="0" src="' +
    iframeSrc +
    '" class="' +
    DEFAULT_IFRAME_CLASS +
    '"/>'
  )
}

function _generateRandomString(length) {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  let str = ''
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return str
}

const chatRefs = {}

// provides proper chat reference
function _getChatRef(chatId) {
  chatId = chatId || DEFAULT_CHAT_ID
  const fakeChatRef = {
    postMessage: function () {
      console.warn(
        'No webchat with id ' + chatId + ' has not been initialized, \n please use window.botpressWebChat.init first.'
      )
    }
  }

  return chatRefs[chatId] || fakeChatRef
}

function configure(payload, chatId) {
  const chatWindow = _getChatRef(chatId)
  chatWindow.postMessage({ action: 'configure', payload: payload }, '*')
}
function sendEvent(payload, chatId) {
  const chatWindow = _getChatRef(chatId)
  chatWindow.postMessage({ action: 'event', payload: payload }, '*')
}
function sendPayload(payload, chatId) {
  const chatWindow = _getChatRef(chatId)
  chatWindow.postMessage({ action: 'sendPayload', payload: payload }, '*')
}
function mergeConfig(payload, chatId) {
  const chatWindow = _getChatRef(chatId)
  chatWindow.postMessage({ action: 'mergeConfig', payload: payload }, '*')
}

/**
 *
 * @param {object} config Configuration object you want to apply to your webchat instance
 * @param {string} targetSelector css selector under which you want your webchat to be rendered
 */
function init(config, targetSelector) {
  targetSelector = targetSelector || 'body'
  const chatId = config.chatId || DEFAULT_CHAT_ID
  const host = config.hostUrl || window.ROOT_PATH || ''

  const cssHref = host + '/inject.css'
  _injectDOMElement('link', 'head', { rel: 'stylesheet', href: cssHref })

  const iframeHTML = _generateIFrameHTML(host, config)

  const containerId = _getContainerId(config.chatId)
  const iframeId = _getIframeId(config.chatId)
  _injectDOMElement('div', targetSelector, { id: containerId, innerHTML: iframeHTML })

  const iframeRef = document.querySelector('#' + containerId + ' #' + iframeId).contentWindow
  chatRefs[chatId] = iframeRef
}

window.botpressWebChat = {
  init: init,
  configure: configure,
  sendEvent: sendEvent,
  mergeConfig: mergeConfig,
  sendPayload: sendPayload
}

window.addEventListener('message', function (payload) {
  const data = payload.data
  if (!data || !data.type) {
    return
  }

  const iframeSelector = '#' + _getIframeId(data.chatId)
  if (data.type === 'setClass') {
    document.querySelector(iframeSelector).setAttribute('class', data.value)
  } else if (data.type === 'setWidth') {
    const width = typeof data.value === 'number' ? data.value + 'px' : data.value

    document.querySelector(iframeSelector).style.width = width
  }
})
