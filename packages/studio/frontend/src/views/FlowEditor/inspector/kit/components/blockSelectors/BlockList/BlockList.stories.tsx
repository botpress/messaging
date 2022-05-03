import { ComponentMeta } from '@storybook/react'
import React from 'react'

import BlockList from '.'

export default {
  title: 'FormKit/Block Selectors/BlockList',
  component: BlockList
} as ComponentMeta<typeof BlockList>
// { id, label, hint, value, disableable, disableText, onAction = () => {} }

const dummyBlockList = [
  { id: '01', name: 'welcome_nyc_day', type: 'text' },
  { id: '11', name: 'welcome_nyc_night', type: 'text' },
  { id: '04', name: 'builtin/setVariable', type: 'code' },
  { id: '033', name: 'employee_agreement', type: 'file' },
  { id: '011', name: 'presentation_3', type: 'video' },
  { id: '022', name: 'nyc_store_location', type: 'location' },
  { id: '03', name: 'nyc_store', type: 'image' },
  { id: '08', name: 'jeans_501_purchase', type: 'card' },
  { id: '02', name: 'onboard_speech', type: 'audio' },
  { id: '05', name: 'select_store_btns', type: 'action_btn' },
  // { id: '06', name: 'select_clothes_type', type: 'dropdown' },
  // { id: '07', name: 'select_day', type: 'single_choice' },
  { id: '09', name: 'jeans_501_collection', type: 'carousel' }
]

export const Default = () => {
  return <BlockList id={'block_list_01'} value={dummyBlockList} label="On Enter" />
}
Default.story = {
  name: 'Main Story'
}
