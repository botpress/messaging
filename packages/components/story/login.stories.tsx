import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import { LoginPrompt } from '../src/renderer/login'
import { defaultMessageConfig } from '../src/utils'

export default {
  title: 'LoginPrompt',
  component: LoginPrompt
} as ComponentMeta<typeof LoginPrompt>

const Template: ComponentStory<typeof LoginPrompt> = (args) => <LoginPrompt {...args} />

export const Primary = Template.bind({})

Primary.args = {
  config: {
    ...defaultMessageConfig,
    onSendData: async (data) => {
      alert(`onSendData called with: ${JSON.stringify(data)}`)
    }
  }
}
