import React from 'react'
import ReactDOM from 'react-dom'

const KEYBOARD_PREPEND_ID = 'bpw-keyboard-prepend'
export class Prepend extends React.Component<KeyboardElementsProps, KeyboardElementsState> {
  state: KeyboardElementsState = { container: null }

  componentDidMount() {
    const container = document.getElementById(KEYBOARD_PREPEND_ID)
    this.setState({ container })
  }

  render() {
    const { container } = this.state
    if (!container) {
      return null
    }

    return ReactDOM.createPortal(this.props.keyboard, container)
  }
}

export class Keyboard extends React.Component {
  render() {
    return (
      <div className={'bpw-keyboard'}>
        <div id={KEYBOARD_PREPEND_ID} />
        {this.props.children}
      </div>
    )
  }
}

interface KeyboardElementsProps {
  /** A keyboard can be any kind of element */
  keyboard: JSX.Element
}

interface KeyboardElementsState {
  container: HTMLElement | null
}
