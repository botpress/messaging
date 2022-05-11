import { ComponentMeta } from '@storybook/react'
import React from 'react'

import EditableTextBlock from '.'

export default {
  title: 'FormKit/EditableTextBlock',
  component: EditableTextBlock
} as ComponentMeta<typeof EditableTextBlock>

export const Primary = () => {
  return <EditableTextBlock type="text" placeholder="Edit this!" error={false} />
}
export const Secondary = () => {
  return <EditableTextBlock type="title" placeholder="Edit this!" error={false} />
}

Primary.story = {
  name: 'Text'
}

Secondary.story = {
  name: 'Title'
}
