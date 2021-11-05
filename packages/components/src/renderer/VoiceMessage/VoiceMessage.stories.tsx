import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import { defaultMessageConfig } from '../../index'

import { VoiceMessage } from '.'

export default {
  title: 'VoiceMessage',
  component: VoiceMessage
} as ComponentMeta<typeof VoiceMessage>

const Template: ComponentStory<typeof VoiceMessage> = (args) => <VoiceMessage {...args} />

export const Primary = Template.bind({})

Primary.args = {
  audio: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav',
  config: { ...defaultMessageConfig, shouldPlay: true }
}
