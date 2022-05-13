import React, { FC } from 'react'
import { connect } from 'react-redux'

import { getCurrentFlowNode } from '../../../../reducers'

import FormKit, { Collapse, BlockList } from '../FormKit'
import { Text } from '../FormKit/shared'
import * as layout from './layout.module.scss'

interface OwnProps {
  currentNode: any
}

const NodePane: FC<OwnProps> = ({ currentNode }) => {
  const { name, onEnter, onReceive } = currentNode
  return (
    <div className={layout.container}>
      <FormKit form={{ heello: 'lol' }}>
        <Collapse idx={0} label="Basic">
          <Text value={name} large />
          <Text value={'just a regular standard normal node.'} />
          <BlockList id="onEnter" label="On Enter" value={onEnter} />
          <BlockList id="onReceive" label="On Receive" value={onReceive || []} />
        </Collapse>
        <Collapse idx={1} label="Transitions">
          <div>todo</div>
        </Collapse>
      </FormKit>
    </div>
  )
}

const mapStateToProps = (state) => ({
  // flows: getAllFlows(state),
  // dirtyFlows: getDirtyFlows(state as never),
  // flowProblems: state.flows.flowProblems,
  // flowsName: getFlowNamesList(state as never),
  currentNode: getCurrentFlowNode(state as never) as any
})

// {
//   "next": [
//       {
//           "condition": "true",
//           "node": ""
//       }
//   ],
//   "id": "ab7904a7c5",
//   "name": "node-8e51",
//   "onEnter": [
//       "say #!builtin_carousel-7CNNq0"
//   ],
//   "onReceive": null,
//   "type": "standard",
//   "x": 5,
//   "y": -240,
//   "lastModified": "2022-05-10T02:33:15.638Z"
// }

const mapDispatchToProps = {
  // deleteFlow,
  // duplicateFlow,
  // renameFlow
}

export default connect(mapStateToProps, mapDispatchToProps)(NodePane)
