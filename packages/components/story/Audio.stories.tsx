import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import { Audio } from '../src/renderer/file'
import { defaultMessageConfig } from '../src/utils'

export default {
  title: 'Files/Audio',
  component: Audio
} as ComponentMeta<typeof Audio>

const Template: ComponentStory<typeof Audio> = (args) => <Audio {...args} />

export const FileLink = Template.bind({})

FileLink.args = {
  audio: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav',
  title: 'Star Wars',
  config: defaultMessageConfig
}
