import React, { useEffect, FC } from 'react'
import { connect } from 'react-redux'
import { getCurrentFlowNode } from '../../../reducers'

import { TabGroup, Tab } from './layout/TabGroup'
import Nodepane from './panes/NodePane'
import * as style from './style.module.scss'

interface OwnProps {
  currentFlowNode: any
}

const Inspector: FC<OwnProps> = ({ currentFlowNode }) => {
  const { type } = currentFlowNode
  // if flow becomes null
  useEffect(() => {
    console.log(currentFlowNode)
  }, [currentFlowNode])

  return currentFlowNode ? (
    <div className={style.container}>
      <TabGroup>
        <Tab id="1" label="test" />
        <Tab id="2" label="test2" />
      </TabGroup>
      {type === 'standard' ? <Nodepane /> : <div>not standard node</div>}
    </div>
  ) : null
}

const mapStateToProps = (state) => ({
  // flows: getAllFlows(state),
  // dirtyFlows: getDirtyFlows(state as never),
  // flowProblems: state.flows.flowProblems,
  // flowsName: getFlowNamesList(state as never),
  currentFlowNode: getCurrentFlowNode(state as never) as any
})

const mapDispatchToProps = {
  // deleteFlow,
  // duplicateFlow,
  // renameFlow
}

export default connect(mapStateToProps, mapDispatchToProps)(Inspector)
