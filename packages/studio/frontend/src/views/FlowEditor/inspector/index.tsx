import { FlowNode } from '@botpress/sdk'
import React, { FC } from 'react'
import shallow from 'zustand/shallow'

import { useDidMountEffect } from '../utils/useDidMountEffect'
import { TabBar } from './layout'
import Pane from './layout/Pane'
import { PaneTypes } from './panes'
import ContentPane from './panes/ContentPane'
import NodePane from './panes/NodePane'
import useInspectorStore from './store'
import * as style from './style.module.scss'

interface OwnProps {
  currentFlowNode: FlowNode
}

const Inspector: FC<OwnProps> = ({ currentFlowNode = {} }) => {
  const { id, type, name } = currentFlowNode
  const [tabs, activeTabIdx, resetInspector] = useInspectorStore(
    (state) => [state.tabs, state.activeTabIdx, state.resetInspector],
    shallow
  )

  useDidMountEffect(() => {
    resetInspector()
  }, [id])

  return (
    <div className={style.inspector}>
      <TabBar contextNodeName={name} />
      <Pane show={activeTabIdx === -1}>{type === PaneTypes.NODE ? <NodePane /> : <div>tbd</div>}</Pane>
      {tabs.map((tab, idx) => (
        <Pane key={tab} show={idx === activeTabIdx}>
          <ContentPane contentId={tab} />
        </Pane>
      ))}
    </div>
  )
}

export default Inspector
