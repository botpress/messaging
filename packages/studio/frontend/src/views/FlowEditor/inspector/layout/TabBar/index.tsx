import React, { FC } from 'react'

import useInspectorStore from '../../store'
import * as style from './style.module.scss'
import Tab from './Tab'

export interface OwnProps {
  contextNodeName: string
}

const TabBar: FC<OwnProps> = ({ contextNodeName }) => {
  const tabs = useInspectorStore((state) => state.tabs)

  return (
    <div className={style.tabs}>
      <div className={style.contextTab}>
        <Tab idx={-1}>{contextNodeName}</Tab>
        <div className={style.divider} />
      { /*<div className={style.contextFade} /> */}
      </div>
      <div className={style.contentTabs}>
        {tabs.map((id, idx) => (
          <Tab idx={idx} key={idx}>
            {id}
          </Tab>
        ))}
      </div>
    </div>
  )
}

export default TabBar
