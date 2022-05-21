import { FlowNode } from '@botpress/sdk'
import React, { useEffect, FC } from 'react'
import shallow from 'zustand/shallow'

import TabBar from './layout/TabBar'
import { PaneTypes } from './panes'
import ContentPane from './panes/ContentPane'
import NodePane from './panes/NodePane'
import useInspectorStore from './store'
import * as style from './style.module.scss'

interface OwnProps {
  currentFlowNode: FlowNode
}

const Inspector: FC<OwnProps> = ({ currentFlowNode = {} }) => {
  const { type, name } = currentFlowNode
  const [tabs, activeTabIdx, resetInspector] = useInspectorStore(
    (state) => [state.tabs, state.activeTabIdx, state.resetInspector],
    shallow
  )

  useEffect(() => {
    resetInspector()
  }, [currentFlowNode])

  return (
    <div className={style.container}>
      <TabBar contextNodeName={name} />
      {type === PaneTypes.NODE ? <NodePane selected={activeTabIdx === -1} /> : <div>tbd</div>}
      {tabs.map((tab, idx) => (
        <ContentPane key={tab} contentId={tab} selected={idx === activeTabIdx} />
      ))}
    </div>
  )
}

export default Inspector
