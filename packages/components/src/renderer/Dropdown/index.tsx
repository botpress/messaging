import React, { useEffect, useMemo, useState } from 'react'
import Select, { MultiValue } from 'react-select'
import Creatable from 'react-select/creatable'
import { MessageTypeHandlerProps } from 'typings'
import Keyboard, { Prepend } from '../Keyboard'

export const Dropdown = ({
  choices,
  text,
  placeholderText,
  allowMultiple,
  allowCreation,
  displayInKeyboard,
  buttonText,
  config
}: MessageTypeHandlerProps<'dropdown'>) => {
  const [selectedOption, setSelectedOption] = useState<any>()
  const options = useMemo(() => choices.map((choice) => ({ label: choice.title, value: choice.value })), [choices])

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
    try {
      void (async () => {
        await sendChoice()
      })()
    } catch (err) {
      console.error(err)
    }
  }, [selectedOption])

  const renderSelect = (inKeyboard: boolean) => {
    return (
      <div className={inKeyboard ? 'bpw-keyboard-quick_reply-dropdown' : ''}>
        <div style={{ width: '100%', display: 'inline-block' }}>
          {allowCreation ? (
            <Creatable
              value={selectedOption}
              onChange={setSelectedOption}
              options={options}
              placeholder={placeholderText}
              isMulti={allowMultiple}
              menuPlacement={'top'}
            />
          ) : (
            <Select
              value={selectedOption}
              onChange={setSelectedOption}
              options={options}
              placeholder={placeholderText}
              isMulti={allowMultiple}
              menuPlacement={'top'}
            />
          )}
        </div>

        {displayInKeyboard && (
          <button className="bpw-button" onClick={sendChoice}>
            {buttonText}
          </button>
        )}
      </div>
    )
  }

  const shouldDisplay = config.isLastGroup && config.isLastOfGroup
  const message = <p>{text}</p>

  if (displayInKeyboard && Keyboard.isReady()) {
    return (
      <Prepend keyboard={renderSelect(true)} visible={shouldDisplay}>
        {message}
      </Prepend>
    )
  }

  return (
    <div>
      {message}
      {shouldDisplay && renderSelect(false)}
    </div>
  )
}
