import { Portal } from '@blueprintjs/core'
import React, { FC } from 'react'
import { connect } from 'react-redux'

import * as style from './style.module.scss'

interface OwnProps {}

const NodePane: FC<OwnProps> = () => {
  return (
    <div className={style.container}>
      <Portal></Portal>
    </div>
  )
}

const mapStateToProps = (state) => ({
  // flows: getAllFlows(state),
  // dirtyFlows: getDirtyFlows(state as never),
  // flowProblems: state.flows.flowProblems,
  // flowsName: getFlowNamesList(state as never),
})

const mapDispatchToProps = {
  // deleteFlow,
  // duplicateFlow,
  // renameFlow
}

export default connect(mapStateToProps, mapDispatchToProps)(NodePane)
