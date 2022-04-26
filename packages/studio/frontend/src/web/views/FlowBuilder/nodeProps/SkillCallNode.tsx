import React, { Component, Fragment } from 'react'

import { Panel, Tabs, Tab, Badge, Button } from 'react-bootstrap'
import { lang } from '~/components/Shared/translations'

import { AccessControl } from '~/components/Shared/Utils'
import EditableInput from '../common/EditableInput'
import TransitionSection from './TransitionSection'

const style = require('./style.scss')

function transformText(text) {
  return text.replace(/[^a-z0-9-_\.]/gi, '_')
}
export default (props) => {
  const renameNode = (text) => {
    if (text) {
      const alreadyExists = props.flow.nodes.find((x) => x.name === text)
      if (!alreadyExists) {
        props.updateNode({ name: text })
      }
    }
  }
  const { node, readOnly } = props

  const editSkill = () => props.requestEditSkill(node.id)

  return (
    <div className={style.node}>
      <Panel>
        <EditableInput
          readOnly={readOnly}
          value={node.name}
          className={style.name}
          onChanged={renameNode}
          transform={transformText}
        />
        <div style={{ padding: '5px' }}>
          <AccessControl resource="bot.skills" operation="write">
            <Button onClick={editSkill}>{lang.tr('studio.flow.node.editSkill')}</Button>
          </AccessControl>
        </div>
      </Panel>
      <Tabs animation={false} id="node-props-modal-skill-node-tabs">
        <Tab
          eventKey="transitions"
          title={
            <Fragment>
              <Badge>{(node.next && node.next.length) || 0}</Badge> {lang.tr('studio.flow.node.transitions')}
            </Fragment>
          }
        >
          <TransitionSection
            readOnly={readOnly}
            items={node.next}
            currentFlow={props.flow}
            header={lang.tr('studio.flow.node.transitions')}
            subflows={props.subflows}
            onItemsUpdated={(items) => props.updateNode({ next: items })}
          />
        </Tab>
      </Tabs>
    </div>
  )
}
