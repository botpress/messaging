import React, { FC } from 'react'
import { connect } from 'react-redux'

import { updateFlowNode } from '~/src/actions'
import { getCurrentFlowNode } from '../../../../reducers'
import FormKit, { BlockList, EditableTextBlock } from '../FormKit'
import Collapse from '../layout/Collapse'

interface OwnProps {
  currentNode: any
  updateFlowNode: any
}

// @TRANSLATE: whole component
const NodePane: FC<OwnProps> = ({ currentNode, updateFlowNode }) => {
  const { id, name, onEnter, onReceive, next } = currentNode

  return (
    <FormKit
      initialValues={{
        onReceive,
        onEnter,
        next,
        name
      }}
      onSubmit={(values, { setSubmitting }) => {
        updateFlowNode({ id, ...values })
        setSubmitting(false)
      }}
    >
      <EditableTextBlock name="name" type="title" />
      <EditableTextBlock name="description" type="text" />

      <Collapse idx={0} label="Basic">
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
  currentNode: getCurrentFlowNode(state as never) as any
})

const mapDispatchToProps = {
  // deleteFlow,
  // duplicateFlow,
  // renameFlow
  updateFlowNode
}

export default connect(mapStateToProps, mapDispatchToProps)(NodePane)
