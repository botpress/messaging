import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import { VoiceMessage } from '../src/renderer/voice'
import { defaultMessageConfig } from '../src/utils'

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
