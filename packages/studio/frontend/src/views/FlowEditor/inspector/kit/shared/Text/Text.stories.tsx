import { ComponentMeta } from '@storybook/react'
import React from 'react'

import Text, { TextIntents } from '.'

const testText = 'Search for a component'

export default {
  title: 'FormKit/shared/SubText',
  component: Text
} as ComponentMeta<typeof Text>

export const Default = () => {
  return <Text value={testText} large />
}
Default.story = {
  name: 'Default Intent'
}

export const Lite = () => {
  return <Text value={testText} intent={TextIntents.LITE} large />
}
Lite.story = {
  name: 'Lite Intent'
}

export const Placeholder = () => {
  return <Text value={testText} intent={TextIntents.PLACEHOLDER} large />
}
Placeholder.story = {
  name: 'Placeholder Intent'
}

export const LitePlaceholder = () => {
  return <Text value={testText} intent={TextIntents.LITE_PLACEHOLDER} large />
}
LitePlaceholder.story = {
  name: 'Lite Placeholder Intent'
}
