import { ComponentMeta } from '@storybook/react'
import React from 'react'

import SelectDropdown from '.'

export default {
  title: 'FormKit/SelectDropdown',
  component: SelectDropdown
} as ComponentMeta<typeof SelectDropdown>

export const Primary = () => {
  return <SelectDropdown label="Select Option" hint="OMGOMG" type="text" placeholder="Edit this!" error={false} />
}

Primary.story = {
  name: 'Main View'
}
