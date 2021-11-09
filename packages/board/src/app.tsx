import 'regenerator-runtime/runtime'
import { ExposedWebChat, Config } from '@botpress/webchat'
import React from 'react'
import ReactDOM from 'react-dom'

// Uncomment this for the test webchat
/*
import { BoardLinker } from './linker'

new BoardLinker(
  document.getElementById('board-linker')!,
  document.getElementById('webchat')!,
  document.getElementById('board-watcher')!
)
*/

const MY_CLIENT_ID = '9221c6a0-a743-4465-be88-5aaae0d285eb'

const webchatConfig: Config = {
  url: 'http://localhost:3100',
  clientId: MY_CLIENT_ID,
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
  showUserAvatar: false,
  showTimestamp: false,
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
