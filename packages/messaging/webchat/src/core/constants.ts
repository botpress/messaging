import { Config } from '../typings'

const DEFAULT_CONFIG: Partial<Config> = {
  botName: undefined,
  botConversationDescription: undefined,
  enableTranscriptDownload: true,
  showConversationsButton: true,
  useSessionStorage: false,
  showTimestamp: false,
  disableAnimations: false,
  hideWidget: false,
  showPoweredBy: false,
  enablePersistHistory: true,
  enableVoiceComposer: false,
  enableConversationDeletion: false,
  closeOnEscape: true
}

export default {
  /** The duration of the hide / show chat */
  ANIMATION_DURATION: 300,

  MIN_TIME_BETWEEN_SOUNDS: 1000,

  SENT_HISTORY_SIZE: 20,

  /** The number of minutes before a new timestamp is displayed */
  TIME_BETWEEN_DATES: 10,

  DEFAULT_LAYOUT_WIDTH: 360,
  DEFAULT_CONTAINER_WIDTH: 360,

  /** The default configuration when starting the chat */
  DEFAULT_CONFIG
}
