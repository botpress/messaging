import React, { useEffect, useMemo, useState } from 'react'
import Select from 'react-select'
import Creatable from 'react-select/creatable'
import { MessageTypeHandlerProps } from '../typings'
import { markdownToHtml } from '../utils'
import { Prepend } from './keyboard'

export const Dropdown = ({
  options,
  message,
  placeholderText,
  allowMultiple,
  allowCreation,
  displayInKeyboard,
  buttonText,
  markdown,
  width,
  config
}: MessageTypeHandlerProps<'dropdown'>) => {
  const [selectedOption, setSelectedOption] = useState<any>()
  const choices = useMemo(() => options.map((o) => ({ label: o.label, value: o.value })), [options])

  const sendChoice = async () => {
    if (!selectedOption) {
      return
    }

    let { label, value } = selectedOption

    if (selectedOption.length) {
      label = selectedOption.map((x: any) => x.label).join(',')
      value = selectedOption.map((x: any) => x.value || x.label).join(',')
    }

    await config.onSendData({ type: 'quick_reply', text: label, payload: value || label })
  }

  useEffect(() => {
    if (buttonText && displayInKeyboard) {
      return
    }
    sendChoice().catch(console.error)
  }, [selectedOption])

  const renderSelect = (inKeyboard: boolean) => {
    return (
      <div className={inKeyboard ? 'bpw-keyboard-single-choice-dropdown' : ''}>
        <div style={{ width: width || '100%', display: 'inline-block' }}>
          {allowCreation ? (
            <Creatable
              value={selectedOption}
              onChange={setSelectedOption}
              options={choices}
              placeholder={placeholderText}
              isMulti={allowMultiple}
              menuPlacement={'top'}
            />
          ) : (
            <Select
              value={selectedOption}
              onChange={setSelectedOption}
              options={choices}
              placeholder={placeholderText}
              isMulti={allowMultiple}
              menuPlacement={'top'}
            />
          )}
        </div>

        {buttonText && (
          <button className="bpw-button" onClick={sendChoice}>
            {buttonText}
          </button>
        )}
      </div>
    )
  }

  const shouldDisplay = config.isLastGroup && config.isLastOfGroup
  let text: JSX.Element
  if (markdown) {
    const html = markdownToHtml(message, config.escapeHTML)
    text = <div dangerouslySetInnerHTML={{ __html: html }} />
  } else {
    text = <p>{message}</p>
  }

  if (shouldDisplay && displayInKeyboard) {
    return (
      <div>
        {text}
        <Prepend keyboard={renderSelect(true)} />
      </div>
    )
  }

  return (
    <div>
      {text}
      {shouldDisplay && renderSelect(false)}
    </div>
  )
}
