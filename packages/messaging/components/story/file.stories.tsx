import { ComponentStory, ComponentMeta } from '@storybook/react'
import React from 'react'
import { File } from '../src/renderer/file'
import { defaultMessageConfig } from '../src/utils'

export default {
  title: 'Files/File',
  component: File
} as ComponentMeta<typeof File>

const Template: ComponentStory<typeof File> = (args) => <File {...args} />

export const FileLink = Template.bind({})

FileLink.args = {
  file: 'https://via.placeholder.com/400.jpg',
  title: '400.jpg',
  config: defaultMessageConfig
}
