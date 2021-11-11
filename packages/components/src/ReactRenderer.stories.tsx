import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import ReactMessageRenderer from '.'
import { defaultMessageConfig } from './utils'

export default {
  title: 'ReactMessageRenderer',
  component: ReactMessageRenderer,
  argTypes: {
    content: {
      control: {
        type: 'object'
      }
    }
  }
} as ComponentMeta<typeof ReactMessageRenderer>

const Template: ComponentStory<typeof ReactMessageRenderer> = (args) => <ReactMessageRenderer {...args} />

export const Primary = Template.bind({})

Primary.args = {
  content: {
    type: 'text',
    text: 'Hello, world!'
  },
  config: defaultMessageConfig
}
