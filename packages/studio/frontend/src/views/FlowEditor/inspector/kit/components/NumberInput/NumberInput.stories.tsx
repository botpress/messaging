import { ComponentMeta } from '@storybook/react'
import React from 'react'

import NumberInput from '.'

export default {
  title: 'FormKit/NumberInput',
  component: NumberInput
} as ComponentMeta<typeof NumberInput>

export const Primary = () => {
  return <NumberInput label="Retry Attemps" hint="This is a hint" req={true} placeholder="23" error={false} />
}
Primary.story = {
  name: 'Main View'
}
