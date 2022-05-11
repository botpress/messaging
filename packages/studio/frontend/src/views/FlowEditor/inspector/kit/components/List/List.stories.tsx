import { ComponentMeta } from '@storybook/react'
import React from 'react'

import List from '.'

export default {
  title: 'FormKit/List',
  component: List
} as ComponentMeta<typeof List>

export const Primary = () => {
  return (
    <List
      label="Messages"
      hint="This is a hint"
      req={true}
      help="Click to add message"
      placeholder="asdfasdf"
      error={false}
    />
  )
}
Primary.story = {
  name: 'Main View'
}
