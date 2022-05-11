import { ComponentMeta } from '@storybook/react'
import React from 'react'

import Text from '.'

export default {
  title: 'FormKit/Text',
  component: Text
} as ComponentMeta<typeof Text>

export const Primary = () => {
  return <Text label="Choose Content" hint="This is a hint" req={true} placeholder="empty" error={false} />
}
export const Secondary = () => {
  return <Text label="Choose Content" hint="This is a hint" req={true} placeholder="empty" error={false} multi />
}

Primary.story = {
  name: 'Single'
}

Secondary.story = {
  name: 'Multi'
}
