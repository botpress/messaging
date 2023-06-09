import ReactMessageRenderer from '@botpress/messaging-components'
import classnames from 'classnames'
import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import { WrappedComponentProps, injectIntl } from 'react-intl'

import { RootStore, StoreDef } from '../../store'
import { Renderer } from '../../typings'
import { postMessageToParent } from '../../utils/webchatEvents'

class Message extends Component<MessageProps> {
  state = {
    hasError: false,
    showMore: false
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true }
  }

  renderTimestamp() {
    return (
      <span className="bpw-message-timestamp">
        {this.props.store!.intl.formatTime(new Date(this.props.sentOn!), { hour: 'numeric', minute: 'numeric' })}
      </span>
    )
  }

  onMessageClick = () => {
    this.props.store?.setSelectedMessage(this.props.messageId!)

    postMessageToParent(
      'MESSAGE.SELECTED',
      {
        id: this.props.messageId,
        conversationId: this.props.store?.currentConversationId,
        sentOn: this.props.sentOn,
        payload: this.props.payload,
        from: this.props.isBotMessage ? 'bot' : 'user'
      },
      this.props.config!.chatId
    )
  }

  render() {
    if (this.state.hasError) {
      return '* Cannot display message *'
    }

    const type = this.props.type || (this.props.payload && this.props.payload.type)
    const wrappedType = this.props.payload && this.props.payload.wrapped && this.props.payload.wrapped.type
    const wrappedClass = `bpw-bubble-${wrappedType}`

    const rendered = (
      <ReactMessageRenderer
        key={this.props.messageId}
        content={this.props.payload}
        config={{
          messageId: this.props.messageId!,
          noMessageBubble: this.props.noBubble!,
          isLastOfGroup: this.props.isLastOfGroup!,
          isLastGroup: this.props.isLastGroup!,
          isBotMessage: this.props.isBotMessage!,
          sentOn: this.props.sentOn!,
          onSendData: this.props.onSendData!,
          onFileUpload: this.props.onFileUpload!,
          store: this.props.store,
          onAudioEnded: this.props.onAudioEnded,
          shouldPlay: this.props.shouldPlay,
          intl: this.props.store!.intl,
          escapeHTML: true,
          showTimestamp: this.props.store!.config.showTimestamp!,
          googleMapsAPIKey: this.props.store!.config.googleMapsAPIKey
        }}
      />
    )

    if (rendered === null) {
      return null
    }

    const additionalStyle = (this.props.payload && this.props.payload['web-style']) || {}

    const messageSelectedClass = {
      'bpw-message-selected': this.props.selectedMessageId === this.props.messageId
    }

    if (this.props.noBubble || this.props.payload?.wrapped?.noBubble) {
      return (
        <div
          className={classnames(this.props.className, wrappedClass, messageSelectedClass, this.props.payload.className)}
          style={additionalStyle}
          onClick={this.onMessageClick}
        >
          {rendered}
        </div>
      )
    }

    return (
      <div
        className={classnames(
          this.props.className,
          wrappedClass,
          'bpw-chat-bubble',
          `bpw-bubble-${type}`,
          this.props.payload.className
        )}
        data-from={this.props.fromLabel}
        tabIndex={-1}
        style={additionalStyle}
      >
        <div
          tabIndex={-1}
          className={classnames('bpw-chat-bubble-content', messageSelectedClass)}
          onClick={this.onMessageClick}
        >
          <span className="sr-only">
            {this.props.store!.intl.formatMessage({
              id: this.props.isBotMessage ? 'message.botSaid' : 'message.iSaid',
              defaultMessage: this.props.isBotMessage ? 'Virtual assistant said : ' : 'I said : '
            })}
          </span>
          {rendered}
          {this.props.store!.config.showTimestamp && this.renderTimestamp()}
        </div>
        {this.props.inlineFeedback}
      </div>
    )
  }
}

export default inject(({ store }: { store: RootStore }) => ({
  intl: store.intl,
  config: store.config,
  selectedMessageId: store.selectedMessageId
}))(injectIntl(observer(Message)))

type MessageProps = Renderer.Message & WrappedComponentProps & Pick<StoreDef, 'intl' | 'selectedMessageId' | 'config'>
