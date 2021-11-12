import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import { LoginPrompt } from '..'
import { defaultMessageConfig } from '../../utils'

export default {
  title: 'LoginPrompt',
  component: LoginPrompt
} as ComponentMeta<typeof LoginPrompt>

const Template: ComponentStory<typeof LoginPrompt> = (args) => <LoginPrompt {...args} />

export const Primary = Template.bind({})

Primary.args = {
  content: {},
  config: {
    ...defaultMessageConfig,
    onSendData: async (data) => {
      alert(`onSendData called with: ${JSON.stringify(data)}`)
    }
  }
}
