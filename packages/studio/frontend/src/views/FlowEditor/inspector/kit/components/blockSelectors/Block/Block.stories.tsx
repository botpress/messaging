import { ComponentMeta } from '@storybook/react'
import React from 'react'

import Block from '.'

const testBlock = { id: '01', name: 'welcome_text_dsdawasdwasdwa', type: 'location' }

export default {
  title: 'FormKit/Block Selectors/Blocks',
  component: Block
} as ComponentMeta<typeof Block>

export const Default = () => {
  return <Block block={testBlock} />
}
Default.story = {
  name: 'Default Type'
}

export const Grab = () => {
  return <Block block={testBlock} grab />
}
Grab.story = {
  name: 'Grab Prop'
}

export const GrabDragging = () => {
  return <Block block={testBlock} grab dragging />
}
GrabDragging.story = {
  name: 'Grab Dragging Prop'
}

export const Temp = () => {
  return <Block block={testBlock} temp />
}
Temp.story = {
  name: 'Temp Prop'
}

export const CodeType = () => {
  return <Block block={testBlock} />
  // type={BlockTypes.CODE}
}
CodeType.story = {
  name: 'Lite Placeholder Intent'
}
