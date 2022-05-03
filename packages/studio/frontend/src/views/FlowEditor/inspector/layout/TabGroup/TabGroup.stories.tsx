import { ComponentMeta } from '@storybook/react'
import React, { useState, useCallback } from 'react'
import { TabGroup, Tab } from '.'
import style from './style.scss'

export default {
  title: 'Inspector Layout/TabGroup',
  component: TabGroup
} as ComponentMeta<typeof TabGroup>

export const Primary = () => {
  const [selectedPane, setSelectedPane] = useState(0)

  const handleTabClick = useCallback(
    (id) => {
      console.log(id)
      // setSelectedPane(panes.find((pane) => pane.id === id))
    },
    [setSelectedPane]
  )

  const handleFormChange = (formId: string, newForm: any) => {
    console.log(formId, newForm)
  }

  return (
    <div className={style.storyContainer}>
      <TabGroup onChange={handleTabClick}>
        <Tab id={'0'} label={'main_label'} />
        <Tab id={'1'} label={'label_02'} />
        <Tab id={'2'} label={'label_03'} />
        <Tab id={'3'} label={'label_04'} />
      </TabGroup>
    </div>
  )
}
Primary.story = {
  name: 'Main View'
}
