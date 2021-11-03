import React, { Component } from 'react'

import { Renderer } from '../../../typings'
import * as Keyboard from '../../Keyboard'

import { Button } from './Button'

/**
 * Displays an array of button, and handle when they are clicked
 *
 * @param {object} buttons The list of buttons to display (object with a label and a payload)
 * @param {function} onSendData Called with the required payload to answer the quick reply
 * @param {function} onFileUpload This is called when a file is uploaded
 *
 * @return onSendData is called with the reply
 */
export class QuickReplies extends Component<Renderer.QuickReply> {
  componentDidMount() {
    this.props.isLastGroup &&
      this.props.isLastOfGroup &&
      this.props.store.composer.setLocked(this.props.disableFreeText)
  }

  componentWillUnmount() {
    this.props.store.composer.setLocked(false)
  }

  handleButtonClicked = (title, payload) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.props.onSendData?.({
      type: 'quick_reply',
      text: title,
      payload
    })
    this.props.store.composer.setLocked(false)
  }

  renderKeyboard(buttons: Renderer.QuickReplyButton[]) {
    return buttons.map((btn, idx) => {
      if (Array.isArray(btn)) {
        return <div>{this.renderKeyboard(btn)}</div>
      } else {
        return (
          <Button
            key={idx}
            label={btn.label || btn.title}
            payload={btn.payload}
            preventDoubleClick={!btn.allowMultipleClick}
            onButtonClick={this.handleButtonClicked}
            onFileUpload={this.props.onFileUpload}
          />
        )
      }
    })
  }

  render() {
    const buttons = this.props.buttons || this.props.quick_replies
    const kbd = <div className={'bpw-keyboard-quick_reply'}>{buttons && this.renderKeyboard(buttons)}</div>

    return (
      <Keyboard.Prepend keyboard={kbd} visible={this.props.isLastGroup && this.props.isLastOfGroup}>
        {this.props.children}
      </Keyboard.Prepend>
    )
  }
}
