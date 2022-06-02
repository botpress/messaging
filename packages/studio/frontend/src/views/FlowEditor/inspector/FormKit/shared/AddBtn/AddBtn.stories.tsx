import { ComponentMeta } from '@storybook/react'
import React from 'react'

import AddBtn from '.'

export default {
  title: 'FormKit/shared/AddBtn',
  component: AddBtn
} as ComponentMeta<typeof AddBtn>

export const Default = () => {
  return <AddBtn />
}
Default.story = {
  name: 'Main Story'
}
