import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import { Video } from '../src/renderer/file'
import { defaultMessageConfig } from '../src/utils'

export default {
  title: 'Files/Video',
  component: Video
} as ComponentMeta<typeof Video>

const Template: ComponentStory<typeof Video> = (args) => <Video {...args} />

export const VideoT = Template.bind({})

VideoT.args = {
  video: 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4',
  title: 'Hello Video',
  config: defaultMessageConfig
}
