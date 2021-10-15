import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import { defaultMessageConfig } from '../../index'

import { File } from '.'

export default {
  title: 'File',
  component: File
} as ComponentMeta<typeof File>

const Template: ComponentStory<typeof File> = (args) => <File {...args} />

export const Image = Template.bind({})

Image.args = {
  payload: {
    file: {
      url: 'https://via.placeholder.com/400.jpg'
    }
  },
  config: defaultMessageConfig
}

export const Video = Template.bind({})

Video.args = {
  payload: {
    file: {
      url: 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4',
      title: 'Hello Video',
      storage: 'remote'
    }
  },
  config: defaultMessageConfig
}

export const Audio = Template.bind({})

Audio.args = {
  payload: {
    file: { url: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav', title: 'Hello Audio', storage: 'remote' }
  },
  config: defaultMessageConfig
}
