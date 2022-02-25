import React, { Component } from 'react'
import { Button } from '../base/button'
import { ChoiceOption } from '../content-typings'
import { MessageTypeHandlerProps } from '../typings'
import { Prepend } from './keyboard'
import { Text } from './text'

/**
 * Displays an array of button, and handle when they are clicked
 */
export class SingleChoice extends Component<MessageTypeHandlerProps<'single-choice'>> {
  componentDidMount() {
    this.props.config.isLastGroup &&
      this.props.config.isLastOfGroup &&
      this.props.config.store?.composer?.setLocked(!!this.props.disableFreeText)
  }

  componentWillUnmount() {
    this.props.config.store?.composer?.setLocked(false)
  }

  handleButtonClicked = (title: string, payload: any) => {
    void this.props.config.onSendData?.({
      type: 'quick_reply',
      text: title,
      payload
    })
    this.props.config.store?.composer?.setLocked(false)
  }

  renderKeyboard(replies: ChoiceOption[]) {
    return replies.map((reply, idx) => {
      if (Array.isArray(reply)) {
        return <div>{this.renderKeyboard(reply)}</div>
      } else {
        return (
          <Button
            key={idx}
            label={reply.title}
            payload={reply.value}
            onButtonClick={this.handleButtonClicked}
            onFileUpload={this.props.config.onFileUpload}
          />
        )
      }
    })
  }

  render() {
    const shouldDisplay = this.props.config.isLastGroup && this.props.config.isLastOfGroup
    const buttons = this.props.choices
    const keyboard = <div className={'bpw-keyboard-single-choice'}>{buttons && this.renderKeyboard(buttons)}</div>
    return (
      <div>
        {this.props.text}
        {shouldDisplay && <Prepend keyboard={keyboard}>{this.props.children}</Prepend>}
      </div>
    )
  }
}

export const QuickReply: React.FC<MessageTypeHandlerProps<'quick_reply'>> = ({ text, config }) => {
  return <Text text={text} config={config} />
}
