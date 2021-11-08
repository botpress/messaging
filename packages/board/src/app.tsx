import 'regenerator-runtime/runtime'
import { ExposedWebChat, Config } from '@botpress/webchat'
import React from 'react'
import ReactDOM from 'react-dom'

const webchatConfig: Config = {
  botId: undefined,
  externalAuthToken: undefined,
  userId: undefined,
  conversationId: undefined,
  userIdScope: undefined,
  enableReset: false,
  stylesheet: undefined,
  isEmulator: false,
  extraStylesheet: undefined,
  showConversationsButton: true,
  showUserName: true,
  showUserAvatar: true,
  showTimestamp: true,
  enableTranscriptDownload: true,
  enableConversationDeletion: true,
  enableArrowNavigation: true,
  closeOnEscape: false,
  botName: undefined,
  composerPlaceholder: undefined,
  avatarUrl: undefined,
  locale: undefined,
  botConvoDescription: undefined,
  overrides: undefined,
  hideWidget: false,
  disableAnimations: false,
  enableResetSessionShortcut: true,
  enableVoiceComposer: true,
  recentConversationLifetime: '5h',
  startNewConvoOnTimeout: false,
  useSessionStorage: false,
  containerWidth: undefined,
  layoutWidth: undefined,
  showPoweredBy: true,
  enablePersistHistory: true,
  exposeStore: false,
  reference: undefined,
  lazySocket: true,
  disableNotificationSound: false,
  chatId: undefined,
  className: undefined
}

ReactDOM.render(<ExposedWebChat config={webchatConfig} fullscreen={true} />, document.getElementById('oldwebchat'))
