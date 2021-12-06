import { ComponentStory, ComponentMeta } from '@storybook/react'
import React, { useEffect, useState } from 'react'
import { Dropdown } from '../src/renderer/dropdown'
import { Keyboard } from '../src/renderer/keyboard'
import { defaultMessageConfig } from '../src/utils'

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
  message: 'Choose an option from the __dropdown__',
  buttonText: 'button text',
  allowCreation: true,
  placeholderText: 'placeholder text',
  allowMultiple: false,
  markdown: true,
  displayInKeyboard: false,
  options: [
    { label: 'Option 1', value: 'option-1' },
    { label: 'Option 2', value: 'option-2' }
  ],
  config: {
    ...defaultMessageConfig,
    onSendData: async (data) => {
      alert('onSendData called with:' + JSON.stringify(data))
    }
  }
}
