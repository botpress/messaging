// import { useFormikContext } from 'formik'
import React, { FC } from 'react'
import { connect } from 'react-redux'

import { updateFlowNode } from '~/src/actions'
import { getCurrentFlowNode } from '../../../../reducers'
// import { useDidMountEffect } from '../../utils/useDidMountEffect'
import FormKit, { BlockList, EditableTextBlock } from '../FormKit'
import { Autosave } from '../FormKit/formHooks'
import Collapse from '../layout/Collapse'

interface OwnProps {
  currentNode: any
  updateFlowNode: any
}

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
        console.log('submit happen', values)
        updateFlowNode(values)
        setSubmitting()
      }}
    >
      <Autosave />
      {/* <div className={layout.head}> */}
      <EditableTextBlock name="name" type="title" />
      <EditableTextBlock name="description" type="text" />
      {/* </div> */}

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
