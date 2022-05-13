import { ComponentMeta } from '@storybook/react'
import React, { useState, useCallback } from 'react'

import Switch from '.'

export default {
  title: 'FormKit/Switch',
  component: Switch
} as ComponentMeta<typeof Switch>

export const Primary = () => {
  const [value, setValue] = useState('false')

  const handleChange = useCallback(
    (id: string, value: string) => {
      setValue(value)
    },
    [setValue]
  )

  return (
    <Switch
      id="checkbox_01"
      value={value}
      onChange={handleChange}
      label="Show Keyboard when surfing"
      hint="Laern Boar about [Skiing](https://google.com) or die in a river at . up to you"
    />
  )
}
Primary.story = {
  name: 'Main View'
}
