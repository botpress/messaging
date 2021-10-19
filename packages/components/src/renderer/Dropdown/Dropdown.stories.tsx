import { ComponentStory, ComponentMeta } from '@storybook/react'
import React, { useEffect, useState } from 'react'
import { defaultMessageConfig } from '../../index'

import Keyboard from '../Keyboard'
import { Dropdown } from '.'

export default {
  title: 'Dropdown',
  component: Dropdown
} as ComponentMeta<typeof Dropdown>

const Template: ComponentStory<typeof Dropdown> = (args) => {
  const [shown, setShown] = useState<boolean>(false)
  useEffect(() => {
    setTimeout(() => {
      setShown(true)
    }, 1)
  }, [setShown])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', justifyContent: 'space-between' }}>
      {shown && <Dropdown {...args} />}
      <Keyboard>
        <textarea placeholder="placeholder composer" />
      </Keyboard>
    </div>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  payload: {
    message: 'Choose an option from the __dropdown__',
    escapeHTML: true,
    markdown: true,
    buttonText: 'button text',
    allowCreation: true,
    placeholderText: 'placeholder text',
    allowMultiple: false,
    width: 400,
    displayInKeyboard: false,
    options: [
      { label: 'Option 1', value: 'option-1' },
      { label: 'Option 2', value: 'option-2' }
    ]
  },
  config: {
    ...defaultMessageConfig,
    onSendData: async (data) => {
      alert('onSendData called with:' + JSON.stringify(data))
    }
  }
}
