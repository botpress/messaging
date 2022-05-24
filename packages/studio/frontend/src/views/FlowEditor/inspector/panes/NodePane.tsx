import React, { FC } from 'react'
import { connect } from 'react-redux'

import { updateFlowNode } from '~/src/actions'
import { getCurrentFlowNode } from '../../../../reducers'
import FormKit, { BlockList, EditableTextBlock } from '../FormKit'
import Autosave from '../FormKit/Autosave'

import Collapse from '../layout/Collapse'

interface OwnProps {
  currentNode: any
  updateFlowNode: any
}

const NodePane: FC<OwnProps> = ({ currentNode, updateFlowNode }) => {
  const { name, onEnter, onReceive, next } = currentNode

  console.log(currentNode)

  return (
    <FormKit
      initialValues={{
        onReceive,
        onEnter,
        next,
        name,
        description: 'This is a standard node pane',
        list: ['OMGOMG', 'WWOWOW', 'LOLOL']
      }}
      onSubmit={(values, { setSubmitting }) => {
        console.log('submit happen', values)
        updateFlowNode(values)
      }}
    >
      <Autosave />
      {/* <div className={layout.head}> */}
      <EditableTextBlock name="name" type="title" />
      <EditableTextBlock name="description" type="text" />
      {/* </div> */}

      <Collapse idx={0} label="Basic">
        {/* <TextInput name="test2" label="test2" req /> */}
        {/* <Switch name="test" label="test" /> */}
        {/* {/* <SelectDropdown name="select" label="Select" />  */}
        {/* <NumberInput name="number" label="Input Number"/> */}
        {/* <SingleContent name="singleContent" label="Select content" /> */}
        {/* <ReorderList name="list" label="Messages" help="Select message" req /> */}

        <BlockList name="onEnter" label="On Enter" />
        <BlockList name="onReceive" label="On Receive" />
      </Collapse>
      <Collapse idx={1} label="Transitions">
        <BlockList name="tmp" label="On Receive" />
      </Collapse>
    </FormKit>
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
