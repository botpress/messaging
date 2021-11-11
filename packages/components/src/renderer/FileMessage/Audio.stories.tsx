import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import { defaultMessageConfig } from '../../utils'

import { Audio } from '.'

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
