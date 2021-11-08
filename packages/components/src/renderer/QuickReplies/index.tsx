import React, { Component } from 'react'
import { MessageTypeHandlerProps } from 'typings'
import { ChoiceOption } from '../../content-typings'
import { Prepend } from '../Keyboard'

import { Button } from './Button'

/**
 * Displays an array of button, and handle when they are clicked
 */
export class QuickReplies extends Component<MessageTypeHandlerProps<'single-choice'>> {
  componentDidMount() {
    this.props.config.isLastGroup &&
      this.props.config.isLastOfGroup &&
      this.props.config.store?.composer?.setLocked(!!this.props.disableFreeText)
  }

  componentWillUnmount() {
    this.props.config.store?.composer?.setLocked(false)
  }

  handleButtonClicked = (title: string, payload: any) => {
    this.props.config.onSendData?.({
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
    const buttons = this.props.choices
    const keyboard = <div className={'bpw-keyboard-quick_reply'}>{buttons && this.renderKeyboard(buttons)}</div>
    return (
      <Prepend keyboard={keyboard} visible={this.props.config.isLastGroup && this.props.config.isLastOfGroup}>
        {this.props.children}
      </Prepend>
    )
  }
}
