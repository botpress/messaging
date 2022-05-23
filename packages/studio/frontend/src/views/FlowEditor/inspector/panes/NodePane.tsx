import React, { FC } from 'react'
import { connect } from 'react-redux'

import { updateFlowNode } from '~/src/actions'
import { getCurrentFlowNode } from '../../../../reducers'
import FormKit, { BlockList, EditableTextBlock } from '../FormKit'
import Autosave from '../FormKit/Autosave'

import Collapse from '../layout/Collapse'
import Pane from '../layout/Pane'
import * as layout from './layout.module.scss'

interface OwnProps {
  currentNode: any
  updateFlowNode: any
  selected?: boolean
}

const NodePane: FC<OwnProps> = ({ currentNode, updateFlowNode, selected }) => {
  const { name, onEnter, onReceive, next } = currentNode

  console.log(currentNode)

  return (
    <Pane show={selected}>
      <FormKit
        initialValues={{
          onReceive,
          onEnter,
          next,
          name,
          description: 'just a regular standard normal node.',
          test: true,
          test2: 'asdf'
        }}
        onSubmit={(values, { setSubmitting }) => {
          console.log('submit happen', values)
          updateFlowNode(values)
        }}
      >
        <div className={layout.head}>
          <EditableTextBlock name="name" type="title" />
          <EditableTextBlock name="description" type="text" />
          <Autosave />
        </div>

        <Collapse idx={0} label="Basic">
          {/* <Switch name="test" label="test" />
          <TextInput name="test2" label="test2" req/>
          <SelectDropdown name="select" label="Select" />
          {/*
          <NumberInput name="number" label="Input Number"/>
          <SingleContent name="singleContent" label="Select content" /> */}

          <BlockList name="onEnter" label="On Enter" />
          <BlockList name="onReceive" label="On Receive" />
        </Collapse>
        <Collapse idx={1} label="Transitions">
          <BlockList name="tmp" label="On Receive" />
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
