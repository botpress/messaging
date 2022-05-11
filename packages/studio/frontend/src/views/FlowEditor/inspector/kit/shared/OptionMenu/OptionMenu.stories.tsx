import { ComponentMeta } from '@storybook/react'
import React from 'react'

import OptionMenu from '.'

export default {
  title: 'FormKit/shared/OptionMenu',
  component: OptionMenu
} as ComponentMeta<typeof OptionMenu>

export const Default = () => {
  return <OptionMenu onAction={console.log} />
}
Default.story = {
  name: 'Main Story'
}
