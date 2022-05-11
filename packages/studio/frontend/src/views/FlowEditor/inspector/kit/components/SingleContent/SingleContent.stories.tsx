import { ComponentMeta } from '@storybook/react'
import React from 'react'

import SingleContent from '.'

export default {
  title: 'FormKit/SingleContent',
  component: SingleContent
} as ComponentMeta<typeof SingleContent>

export const Primary = () => {
  return <SingleContent label="Choose Content" hint="This is a hint" req={true} placeholder="empty" error={false} />
}
Primary.story = {
  name: 'Main View'
}
