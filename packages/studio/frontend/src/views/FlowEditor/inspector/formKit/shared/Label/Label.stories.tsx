import { ComponentMeta } from '@storybook/react'
import React from 'react'

import Label from '.'

export default {
  title: 'FormKit/shared/Label',
  component: Label
} as ComponentMeta<typeof Label>

export const Primary = () => (
  <Label label="something" hint="hello this is what help looks like. [View Doc](https://google.com)" required />
)
Primary.story = {
  name: 'Main View'
}
