import React, { Component } from 'react'
import Highlighter from 'react-highlight-words'
import Select from 'react-select'

import style from './actionDropdown.scss'

export default class SelectActionDropdown extends Component<any> {
  private _inputValue: string

  renderOption = (option) => {
    const highlight = (txt) => <Highlighter searchWords={[this._inputValue]} textToHighlight={txt} />

    if (option.metadata) {
      const category = option.metadata.category ? (
        <span className={style.category}>{highlight(option.metadata.category)} –</span>
      ) : null
      const title = option.metadata.title ? (
        <span className={style.title}>{highlight(option.metadata.title)}</span>
      ) : null

      return (
        <div>
          <span>
            {category}
            {title}
            <span className={style.name}>–&gt; {highlight(option.label)}</span>
          </span>
        </div>
      )
    }

    return highlight(option.label)
  }

  render() {
    return (
      <Select
        onInputChange={(inputValue) => (this._inputValue = inputValue)}
        onChange={this.props.onChange}
        options={this.props.options}
        value={this.props.value}
        isClearable={this.props.isClearable}
        formatOptionLabel={this.renderOption}
        menuPortalTarget={document.getElementById('menuOverlayPortal')}
      />
    )
  }
}
