import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import { defaultMessageConfig } from '../../index'

import { Text } from '.'

export default {
  title: 'Text',
  component: Text
} as ComponentMeta<typeof Text>

const Template: ComponentStory<typeof Text> = (args) => <Text {...args} />

export const Primary = Template.bind({})

Primary.args = {
  text: 'Hello *World*',
  markdown: true,
  config: defaultMessageConfig
}
