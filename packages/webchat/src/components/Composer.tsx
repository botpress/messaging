import { observe } from 'mobx'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { WrappedComponentProps, injectIntl, FormattedMessage } from 'react-intl'

import { RootStore, StoreDef } from '../store'
import ToolTip from './common/ToolTip'

import VoiceRecorder from './VoiceRecorder'

class Composer extends React.Component<ComposerProps, { isRecording: boolean }> {
  private textInput: React.RefObject<HTMLTextAreaElement>
  constructor(props: ComposerProps) {
    super(props)
    this.textInput = React.createRef()
    this.state = { isRecording: false }
  }

  componentDidMount() {
    this.focus()

    observe(this.props.focusedArea!, (focus) => {
      focus.newValue === 'input' && this.textInput.current?.focus()
    })
  }

  componentWillReceiveProps(newProps: Readonly<ComposerProps>) {
    // Focus on the composer when it's unlocked
    if (this.props.composerLocked === true && newProps.composerLocked === false) {
      this.focus()
    }
  }

  focus = () => {
    setTimeout(() => {
      this.textInput.current?.focus()
    }, 50)
  }

  handleKeyPress = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      await this.props.sendMessage!()
    }
  }

  handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      this.props.recallHistory!(e.key)
    }
  }

  handleMessageChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => this.props.updateMessage!(e.target.value)

  isLastMessageFromBot = (): boolean => {
    return this.props.currentConversation?.messages?.slice(-1)?.pop()?.authorId === undefined
  }

  onVoiceStart = () => {
    this.setState({ isRecording: true })
  }

  onVoiceEnd = async (voice: Buffer, ext: string) => {
    this.setState({ isRecording: false })

    await this.props.sendVoiceMessage!(voice, ext)
  }

  onVoiceNotAvailable = () => {
    console.warn(
      'Voice input is not available on this browser. Please check https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder for compatibility'
    )
  }

  render() {
    if (this.props.composerHidden) {
      return null
    }

    const placeholder =
      this.props.composerPlaceholder ||
      this.props.intl.formatMessage(
        {
          id: this.isLastMessageFromBot() ? 'composer.placeholder' : 'composer.placeholderInit'
        },
        { name: this.props.botName }
      )

    return (
      <div role="region" className={'bpw-composer'}>
        <div className={'bpw-composer-inner'}>
          <textarea
            ref={this.textInput}
            id="input-message"
            onFocus={this.props.setFocus!.bind(this, 'input')}
            placeholder={placeholder}
            onChange={this.handleMessageChanged}
            value={this.props.message}
            onKeyPress={this.handleKeyPress}
            onKeyDown={this.handleKeyDown}
            aria-label={this.props.intl.formatMessage({
              id: 'composer.message',
              defaultMessage: 'Message to send'
            })}
            disabled={this.props.composerLocked}
          />
          <label htmlFor="input-message" style={{ display: 'none' }}>
            {placeholder}
          </label>
          <div className={'bpw-send-buttons'}>
            {this.props.enableVoiceComposer && (
              <VoiceRecorder
                onStart={this.onVoiceStart}
                onDone={this.onVoiceEnd}
                onNotAvailable={this.onVoiceNotAvailable}
              />
            )}
            <ToolTip
              childId="btn-send"
              content={this.props.intl.formatMessage({
                id: 'composer.sendMessage',
                defaultMessage: 'Send Message'
              })}
            >
              <button
                className={'bpw-send-button'}
                disabled={!this.props.message!.length || this.props.composerLocked || this.state.isRecording}
                onClick={this.props.sendMessage!.bind(this, undefined)}
                aria-label={this.props.intl.formatMessage({
                  id: 'composer.send',
                  defaultMessage: 'Send'
                })}
                id="btn-send"
              >
                <FormattedMessage id={'composer.send'} />
              </button>
            </ToolTip>
          </div>
        </div>
      </div>
    )
  }
}

export default inject(({ store }: { store: RootStore }) => ({
  enableVoiceComposer: store.config.enableVoiceComposer,
  message: store.composer.message,
  composerLocked: store.composer.locked,
  composerHidden: store.composer.hidden,
  composerPlaceholder: store.composer.composerPlaceholder,
  updateMessage: store.composer.updateMessage,
  recallHistory: store.composer.recallHistory,
  intl: store.intl,
  sendMessage: store.sendMessage,
  sendVoiceMessage: store.sendVoiceMessage,
  botName: store.botName,
  setFocus: store.view.setFocus,
  focusedArea: store.view.focusedArea,
  focusPrevious: store.view.focusPrevious,
  focusNext: store.view.focusNext,
  currentConversation: store.currentConversation,
  preferredLanguage: store.preferredLanguage
}))(injectIntl(observer(Composer)))

type ComposerProps = {
  composerPlaceholder?: string
  composerLocked?: boolean
  composerHidden?: boolean
} & WrappedComponentProps &
  Pick<
    StoreDef,
    | 'botName'
    | 'composerPlaceholder'
    | 'intl'
    | 'focusedArea'
    | 'sendMessage'
    | 'sendVoiceMessage'
    | 'focusPrevious'
    | 'focusNext'
    | 'recallHistory'
    | 'setFocus'
    | 'updateMessage'
    | 'message'
    | 'enableVoiceComposer'
    | 'currentConversation'
    | 'preferredLanguage'
  >
