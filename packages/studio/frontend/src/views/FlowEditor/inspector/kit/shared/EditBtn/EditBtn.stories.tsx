import { ComponentMeta } from '@storybook/react'
import React from 'react'

import EditBtn from '.'

export default {
  title: 'FormKit/shared/EditBtn',
  component: EditBtn
} as ComponentMeta<typeof EditBtn>

export const Default = () => {
  return <EditBtn />
}
Default.story = {
  name: 'Main Story'
}
