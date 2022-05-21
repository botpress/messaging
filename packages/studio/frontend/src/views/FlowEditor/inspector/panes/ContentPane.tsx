import React, { FC } from 'react'
import { connect } from 'react-redux'

import FormKit from '../FormKit'
import { Text } from '../FormKit/shared'
import Collapse from '../layout/Collapse'
import Pane from '../layout/Pane'
import * as layout from './layout.module.scss'

interface OwnProps {
  contentId: any
  selected?: boolean
}

const ContentPane: FC<OwnProps> = ({ contentId, selected }) => {
  return (
    <Pane show={selected}>
      <FormKit initialValues={{}} onSubmit={console.log}>
        <Collapse idx={0} label="Basic">
          <div className={layout.head}>
            <Text value={contentId} large />
            <Text value={'just a regular standard normal node.'} />
          </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ContentPane)
