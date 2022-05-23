import React, { FC } from 'react'
import { connect } from 'react-redux'

import { updateFlowNode } from '~/src/actions'
import { getCurrentFlowNode } from '../../../../reducers'

import FormKit, { BlockList } from '../FormKit'
import { Text } from '../FormKit/shared'
import Collapse from '../layout/Collapse'
import Pane from '../layout/Pane'

interface OwnProps {
  currentNode: any
  updateFlowNode: any
  selected?: boolean
}

const NodePane: FC<OwnProps> = ({ currentNode, updateFlowNode, selected }) => {
  const { name, onEnter, onReceive, next } = currentNode

  return (
    <Pane show={selected}>
      <FormKit
        initialValues={{
          onReceive,
          onEnter,
          next
        }}
        onSubmit={(values, { setSubmitting }) => {
          console.log('submit happen')
          updateFlowNode(values)
        }}
      >
        <Text value={name} large />
        <Text value={'just a regular standard normal node.'} />
        <Collapse idx={0} label="Basic">
          <BlockList name="onEnter" label="On Enter" />
          <BlockList name="onReceive" label="On Receive" />
        </Collapse>
        <Collapse idx={1} label="Transitions">
          <div>todo</div>
        </Collapse>
      </FormKit>
    </Pane>
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
  updateFlowNode
}

export default connect(mapStateToProps, mapDispatchToProps)(NodePane)
