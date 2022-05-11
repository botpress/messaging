import { ComponentMeta } from '@storybook/react'
import React, { useState } from 'react'

import DynamicBtn from '.'

export default {
  title: 'FormKit/shared/DynamicBtn',
  component: DynamicBtn
} as ComponentMeta<typeof DynamicBtn>

export const Primary = () => {
  const [isOn, setIsOn] = useState(false)

  return <DynamicBtn active={isOn} onClick={() => setIsOn(!isOn)} />
}
Primary.story = {
  name: 'Main View'
}
