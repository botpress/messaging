import { ComponentMeta } from '@storybook/react'
import React from 'react'

import ContentList from '.'

export default {
  title: 'FormKit/ContentList',
  component: ContentList
} as ComponentMeta<typeof ContentList>

export const Primary = () => {
  return <ContentList label="On Enter" type="text" placeholder="empty" req={true} error={false} />
}

Primary.story = {
  name: 'Main View'
}
