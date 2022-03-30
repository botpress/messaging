import classnames from 'classnames'
import debounce from 'lodash/debounce'
import set from 'lodash/set'
import { observe } from 'mobx'
import { inject, observer } from 'mobx-react'
import queryString from 'query-string'
import React from 'react'
import { injectIntl, WrappedComponentProps } from 'react-intl'

import Container from './components/Container'
import constants from './core/constants'
import BpSocket from './core/socket'
import ChatIcon from './icons/Chat'
import { RootStore, StoreDef } from './store'
import { Config, Message } from './typings'
import { isIE } from './utils'
import { initializeAnalytics, trackMessage, trackWebchatState } from './utils/analytics'

export const DEFAULT_TYPING_DELAY = 1000

interface IframeAPIPayload {
  text: string
  type: 'show' | 'hide' | 'toggle' | 'message' | 'loadConversation' | 'toggleBotInfo' | string
  conversationId?: string
}
interface IframeAPIData {
  data:
    | {
        action: 'event'
        payload: IframeAPIPayload
      }
    | {
        action: 'configure' | 'mergeConfig' | 'sendPayload'
        payload: Config
      }
}

class Web extends React.Component<MainProps> {
  private config!: Config
  private socket!: BpSocket
  private parentClass!: string
  private hasBeenInitialized: boolean = false
  private audio!: HTMLAudioElement

  constructor(props: MainProps) {
    super(props)

    initializeAnalytics()
  }

  async componentDidMount() {
    this.audio = new Audio(require('url:../assets/notification.mp3'))
    this.props.setIntlProvider!(this.props.intl)

    window.store = this.props.store!

    window.addEventListener('message', this.handleIframeApi)
    window.addEventListener('keydown', this.handleKeyDown)

    await this.loadConfig()
    await this.initializeIfChatDisplayed()

    this.props.setLoadingCompleted!()
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleIframeApi)
    window.removeEventListener('keydown', this.handleKeyDown)
  }

  componentDidUpdate() {
    if (this.config) {
      void this.initializeIfChatDisplayed()
    }
  }

  async initializeIfChatDisplayed() {
    if (this.hasBeenInitialized) {
      return
    }

    if (this.props.activeView === 'side' || this.props.isFullscreen) {
      this.hasBeenInitialized = true

      if (this.isLazySocket() || !this.socket) {
        await this.initializeSocket()
      }

      await this.socket.connect()
      this.props.setSocket!(this.socket)
      await this.props.initializeChat!()
    }
  }

  async loadConfig() {
    this.config = this.extractConfig()
    this.props.updateConfig!(this.config)

    if (this.config.exposeStore) {
      const storePath = this.config.chatId ? `${this.config.chatId}.webchat_store` : 'webchat_store'
      set(window.parent, storePath, this.props.store)
    }

    if (this.config.containerWidth) {
      this.postMessageToParent('setWidth', this.config.containerWidth)
    }

    await this.props.fetchBotInfo!()

    if (!this.isLazySocket()) {
      await this.initializeSocket()
    }

    this.setupObserver()
  }

  postMessageToParent(type: string, value: any) {
    window.parent?.postMessage({ type, value, chatId: this.config.chatId }, '*')
  }

  extractConfig(): Config {
    let userConfig = Object.assign({}, constants.DEFAULT_CONFIG, this.props.config)
    const { options } = queryString.parse(location.search)
    if (!options || typeof options !== 'string') {
      console.warn(`Cannot decode option. Invalid format: ${typeof options}, expecting 'string'.`)

      return userConfig
    }

    try {
      const parsedOptions: { config: Config } = JSON.parse(decodeURIComponent(options))
      userConfig = Object.assign(userConfig, parsedOptions.config)

      return userConfig
    } catch (err) {
      // TODO: Handle those errors so they don't directly bubble up to the users
      throw new Error(`An error occurred while extracting the configurations ${err}`)
    }
  }

  async initializeSocket() {
    this.socket = new BpSocket(this.config)
    this.socket.onMessage = this.handleNewMessage

    this.socket.setup()
    await this.socket.connect()
    this.props.setSocket!(this.socket)
  }

  setupObserver() {
    observe(this.props.dimensions!, 'container', (data) => {
      if (data.newValue) {
        this.postMessageToParent('setWidth', data.newValue)
      }
    })
  }

  isCurrentConversation = (event: Message) => {
    return this.props.currentConversationId === event.conversationId
  }

  handleKeyDown = async (e: KeyboardEvent) => {
    if (!this.props.config?.closeOnEscape) {
      return
    }

    if (e.key === 'Escape') {
      this.props.hideChat!()
    }
  }

  handleIframeApi = async ({ data }: IframeAPIData) => {
    switch (data.action) {
      case 'configure':
        return this.props.updateConfig!(Object.assign({}, constants.DEFAULT_CONFIG, data.payload))
      case 'mergeConfig':
        this.props.mergeConfig!(data.payload)

        const oldUserId = this.socket.socket.userId
        await this.socket.reload(data.payload)

        if (this.socket.socket.userId !== oldUserId) {
          this.props.resetConversation!()
          await this.props.initializeChat!()
        }
        return
      case 'sendPayload':
        return this.props.sendData!(data.payload)
      case 'event':
        const { type, text, conversationId } = data.payload

        if (type === 'show') {
          this.props.showChat!()
          trackWebchatState('show')
        } else if (type === 'hide') {
          this.props.hideChat!()
          trackWebchatState('hide')
        } else if (type === 'toggle') {
          this.props.displayWidgetView ? this.props.showChat!() : this.props.hideChat!()
          trackWebchatState('toggle')
        } else if (type === 'message') {
          trackMessage('sent')
          await this.props.sendMessage!(text)
        } else if (type === 'loadConversation') {
          await this.props.fetchConversation!(conversationId)
        } else if (type === 'toggleBotInfo') {
          this.props.toggleBotInfo!()
        } else {
          await this.props.sendData!({ type, payload: data.payload })
        }
      default:
        break
    }
  }

  handleNewMessage = async (event: Message) => {
    if (!this.isCurrentConversation(event)) {
      // don't do anything, it's a message from another conversation
      return
    }

    if (event.authorId === undefined) {
      const value = (event.payload.type === 'typing' ? event.payload.value : undefined) || DEFAULT_TYPING_DELAY
      await this.handleTyping({ ...event, timeInMs: value })
    }

    if (event.payload?.type === 'visit') {
      // don't do anything, it's the system message
      return
    }

    trackMessage('received')

    this.props.updateLastMessage!(event.conversationId, event)
    await this.props.addEventToConversation!(event)

    // there's no focus on the actual conversation
    if (!document.hasFocus() || this.props.activeView !== 'side') {
      await this.playSound()
      this.props.incrementUnread!()
    }

    this.handleResetUnreadCount()
  }

  handleTyping = async (event: Message) => {
    await this.props.updateTyping!(event)
  }

  playSound = debounce(async () => {
    const disableNotificationSound = this.config.disableNotificationSound || this.props.config?.disableNotificationSound
    if (disableNotificationSound || this.audio.readyState < 2) {
      return
    }

    await this.audio.play()
  }, constants.MIN_TIME_BETWEEN_SOUNDS)

  isLazySocket() {
    if (this.config.lazySocket !== undefined) {
      return this.config.lazySocket
    }
    return this.props.botInfo?.lazySocket
  }

  handleResetUnreadCount = () => {
    if (document.hasFocus() && this.props.activeView === 'side') {
      this.props.resetUnread!()
    }
  }

  renderWidget() {
    if (!this.props.showWidgetButton) {
      return null
    }

    return (
      <button
        className={classnames('bpw-widget-btn', 'bpw-floating-button', {
          [`bpw-anim-${this.props.widgetTransition}` || 'none']: true
        })}
        aria-label={this.props.intl.formatMessage({ id: 'widget.toggle' })}
        onClick={this.props.showChat!.bind(this)}
      >
        <ChatIcon />
        {this.props.hasUnreadMessages && <span className={'bpw-floating-button-unread'}>{this.props.unreadCount}</span>}
      </button>
    )
  }

  applyAndRenderStyle() {
    const parentClass = classnames(`bp-widget-web bp-widget-${this.props.activeView}`, {
      'bp-widget-hidden': !this.props.showWidgetButton && this.props.displayWidgetView,
      [this.props.config?.className!]: !!this.props.config?.className
    })

    if (this.parentClass !== parentClass) {
      this.postMessageToParent('setClass', parentClass)
      this.parentClass = parentClass
    }

    const stylesheet = this.props.config!.stylesheet
    const extraStylesheet = this.props.botInfo?.extraStylesheet
    const RobotoFont = React.lazy(() => import('./fonts/roboto'))

    return (
      <React.Fragment>
        {!!stylesheet?.length && <link rel="stylesheet" type="text/css" href={stylesheet} />}
        <React.Suspense fallback={<></>}>{!isIE && <RobotoFont />}</React.Suspense>
        {!!extraStylesheet?.length && <link rel="stylesheet" type="text/css" href={extraStylesheet} />}
      </React.Fragment>
    )
  }

  render() {
    if (!this.props.isWebchatReady) {
      return null
    }

    return (
      <div onFocus={this.handleResetUnreadCount}>
        {this.applyAndRenderStyle()}
        <h1 id="tchat-label" className="sr-only" tabIndex={-1}>
          {this.props.intl!.formatMessage({
            id: 'widget.title',
            defaultMessage: 'Chat window'
          })}
        </h1>
        {this.props.displayWidgetView ? this.renderWidget() : <Container />}
      </div>
    )
  }
}

export default inject(({ store }: { store: RootStore }) => ({
  store,
  config: store.config,
  sendData: store.sendData,
  initializeChat: store.initializeChat,
  botInfo: store.botInfo,
  fetchBotInfo: store.fetchBotInfo,
  updateConfig: store.updateConfig,
  mergeConfig: store.mergeConfig,
  addEventToConversation: store.addEventToConversation,
  clearMessages: store.clearMessages,
  updateTyping: store.updateTyping,
  sendMessage: store.sendMessage,
  updateBotUILanguage: store.updateBotUILanguage,
  isWebchatReady: store.view.isWebchatReady,
  showWidgetButton: store.view.showWidgetButton,
  hasUnreadMessages: store.view.hasUnreadMessages,
  unreadCount: store.view.unreadCount,
  resetUnread: store.view.resetUnread,
  incrementUnread: store.view.incrementUnread,
  activeView: store.view.activeView,
  isFullscreen: store.view.isFullscreen,
  showChat: store.view.showChat,
  hideChat: store.view.hideChat,
  toggleBotInfo: store.view.toggleBotInfo,
  dimensions: store.view.dimensions,
  widgetTransition: store.view.widgetTransition,
  displayWidgetView: store.view.displayWidgetView,
  setLoadingCompleted: store.view.setLoadingCompleted,
  sendFeedback: store.sendFeedback,
  updateLastMessage: store.updateLastMessage,
  fetchConversation: store.fetchConversation,
  setIntlProvider: store.setIntlProvider,
  setSocket: store.setSocket,
  currentConversationId: store.currentConversationId,
  resetConversation: store.resetConversation
}))(injectIntl(observer(Web)))

type MainProps = { store?: RootStore } & WrappedComponentProps &
  Pick<
    StoreDef,
    | 'config'
    | 'initializeChat'
    | 'botInfo'
    | 'fetchBotInfo'
    | 'sendMessage'
    | 'sendData'
    | 'intl'
    | 'updateTyping'
    | 'updateBotUILanguage'
    | 'hideChat'
    | 'showChat'
    | 'toggleBotInfo'
    | 'widgetTransition'
    | 'activeView'
    | 'isFullscreen'
    | 'unreadCount'
    | 'hasUnreadMessages'
    | 'showWidgetButton'
    | 'addEventToConversation'
    | 'clearMessages'
    | 'updateConfig'
    | 'mergeConfig'
    | 'isWebchatReady'
    | 'incrementUnread'
    | 'displayWidgetView'
    | 'resetUnread'
    | 'setLoadingCompleted'
    | 'dimensions'
    | 'updateLastMessage'
    | 'fetchConversation'
    | 'setIntlProvider'
    | 'setSocket'
    | 'currentConversationId'
    | 'resetConversation'
  >
