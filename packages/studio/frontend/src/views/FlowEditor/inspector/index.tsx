import { FlowNode } from '@botpress/sdk'
import React, { useEffect, FC } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import shallow from 'zustand/shallow'

import TabBar from './layout/TabBar'
import { PaneTypes } from './panes'
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

  const renderPane = (pt: PaneTypes) => {
    switch (pt) {
      case PaneTypes.NODE:
        return <NodePane />
      case PaneTypes.BLOCK:
        return <div>Block {tabs[activeTabIdx]}</div>
      case PaneTypes.SKILL:
        return <div>Skill TBD</div>
    }
  }

  useEffect(() => {
    resetInspector()
  }, [currentFlowNode])

  return (
    <DragDropContext>
      <div className={style.container}>
        <TabBar contextNodeName={name} />
        {activeTabIdx === -1 ? renderPane(type as PaneTypes) : renderPane(PaneTypes.BLOCK)}
      </div>
    </DragDropContext>
  )
}

export default Inspector
