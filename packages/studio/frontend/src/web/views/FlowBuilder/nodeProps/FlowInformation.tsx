import classnames from 'classnames'
import React, { Fragment } from 'react'

import { Tabs, Tab, Badge } from 'react-bootstrap'

import { lang } from '~/components/Shared/translations'
import ActionSection from './ActionSection'
import TransitionSection from './TransitionSection'

const style = require('./style.scss')
export default (props) => {
  const { readOnly } = props

  const catchAll = Object.assign(
    {
      onReceive: [],
      next: []
    },
    props.currentFlow && props.currentFlow.catchAll
  )

  return (
    <div className={classnames(style.node)}>
      <Tabs animation={false} id="node-props-modal-flow-tabs">
        <Tab
          eventKey="on_receive"
          title={
            <Fragment>
              <Badge>{(catchAll.onReceive && catchAll.onReceive.length) || 0}</Badge> On Receive
            </Fragment>
          }
        >
          <ActionSection
            readOnly={readOnly}
            items={catchAll.onReceive}
            // @ts-ignore
            header={lang.tr('studio.flow.node.onReceive')}
            onItemsUpdated={(items) => props.updateFlow({ catchAll: { ...catchAll, onReceive: items } })}
            copyItem={(item) => props.copyFlowNodeElement({ action: item })}
            pasteItem={() => props.pasteFlowNodeElement('onReceive')}
            canPaste={Boolean(props.buffer.action)}
          />
        </Tab>
        <Tab
          eventKey="transitions"
          title={
            <Fragment>
              <Badge>{(catchAll.next && catchAll.next.length) || 0}</Badge> Transitions
            </Fragment>
          }
        >
          <TransitionSection
            readOnly={readOnly}
            items={catchAll.next}
            header={lang.tr('studio.flow.node.transitions')}
            currentFlow={props.currentFlow}
            subflows={props.subflows}
            onItemsUpdated={(items) => props.updateFlow({ catchAll: { ...catchAll, next: items } })}
            copyItem={(item) => props.copyFlowNodeElement({ transition: item })}
            pasteItem={() => props.pasteFlowNodeElement('next')}
            canPaste={Boolean(props.buffer.transition)}
          />
        </Tab>
      </Tabs>
    </div>
  )
}
