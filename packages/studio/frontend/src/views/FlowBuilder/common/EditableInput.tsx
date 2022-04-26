import classnames from 'classnames'
import React, { Component } from 'react'

import style from './style.scss'

const KEY_A = 65

export default class EditableInput extends Component<any, any> {
  private input: HTMLInputElement

  constructor(props: any) {
    super(props)
    this.state = {
      value: props.value || props.defaultValue
    }
  }

  componentDidMount() {
    this.props.onMount && this.props.onMount(this.input)
    if (this.props.shouldFocus) {
      this.input.focus()
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: any) {
    this.setState({ value: nextProps.value || nextProps.defaultValue })
  }

  onChanged = (event) => {
    let txt = event.target.value
    if (this.props.transform) {
      txt = this.props.transform(txt)
    }

    this.setState({ value: txt })
  }

  onKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.keyCode === KEY_A) {
      event.target.select()
    }

    if (event.keyCode === 13) {
      // Enter
      event.target.blur()
    }
  }

  onBlur = () => {
    if (this.props.readOnly) {
      return
    }

    if (!this.props.value.length) {
      this.props.onChanged && this.props.onChanged(this.state.defaultValue)
    } else {
      this.props.onChanged && this.props.onChanged(this.state.value)
    }
  }

  render() {
    const inputWidth = Math.max(120, 20 + 8 * this.props.value.length) + 'px'
    // TODO: should the class check take into account `state.value` instead?
    const inputClass = classnames(style.editableInput, this.props.className, {
      [style.defaultValue]: this.props.value === this.props.defaultValue
    })

    return (
      <input
        className={inputClass}
        type="text"
        ref={(el) => (this.input = el)}
        style={{ width: inputWidth }}
        autoComplete="off"
        value={this.state.value}
        disabled={!!this.props.readOnly}
        onBlur={this.onBlur}
        onChange={this.onChanged}
        onKeyDown={this.onKeyDown}
      />
    )
  }
}
