import React, { Fragment } from 'react'

import { Tabs, Tab, Badge, Panel } from 'react-bootstrap'
import { toast } from '~/components/Shared/Toaster'
import { lang } from '~/components/Shared/translations'

import EditableInput from '../common/EditableInput'

import ActionSection from './ActionSection'
import style from './style.scss'
import TransitionSection from './TransitionSection'

function transformText(text: string) {
  return text.replace(/[^a-z0-9-_\.]/gi, '_')
}
export default (props) => {
  const onChange = (text) => {
    if (!text) {
      return toast.failure(lang.tr('studio.flow.node.emptyName'))
    }

    if (text === props.node.name) {
      return props.node
    }

    const alreadyExists = props.flow.nodes.find((x) => x.name === text)
    if (alreadyExists) {
      return toast.failure(lang.tr('studio.flow.node.nameAlreadyExists'))
    }

    props.updateNode({ name: text })
  }

  const { node, readOnly, isLastNode } = props

  return (
    <div className={style.node}>
      <Panel>
        <EditableInput
          /* We should always sugest that the name should be changed
             if the node has the default name and it is the last created */
          key={node.id}
          shouldFocus={isLastNode && node.name.match(/node-(\w|\n){4}$/g)}
          readOnly={readOnly}
          value={node.name}
          className={style.name}
          onChanged={onChange}
          transform={transformText}
        />
      </Panel>
      <Tabs animation={false} id="node-props-modal-standard-node-tabs">
        {!props.transitionOnly && (
          <Tab
            eventKey="on_enter"
            title={
              <Fragment>
                <Badge>{(node.onEnter && node.onEnter.length) || 0}</Badge> {lang.tr('studio.flow.node.onEnter')}
              </Fragment>
            }
          >
            <ActionSection
              readOnly={readOnly}
              items={node.onEnter}
              // @ts-ignore
              header={lang.tr('studio.flow.node.onEnter')}
              onItemsUpdated={(items) => props.updateNode({ onEnter: items })}
              copyItem={(item) => props.copyFlowNodeElement({ action: item })}
              pasteItem={() => props.pasteFlowNodeElement('onEnter')}
              canPaste={Boolean(props.buffer.action)}
            />
          </Tab>
        )}
        {!props.transitionOnly && (
          <Tab
            eventKey="on_receive"
            title={
              <Fragment>
                <Badge>{(node.onReceive && node.onReceive.length) || 0}</Badge> {lang.tr('studio.flow.node.onReceive')}
              </Fragment>
            }
          >
            <ActionSection
              readOnly={readOnly}
              items={node.onReceive}
              // @ts-ignore
              header={lang.tr('studio.flow.node.onReceive')}
              waitable
              onItemsUpdated={(items) => props.updateNode({ onReceive: items })}
              copyItem={(item) => props.copyFlowNodeElement({ action: item })}
              pasteItem={() => props.pasteFlowNodeElement('onReceive')}
              canPaste={Boolean(props.buffer.action)}
            />
          </Tab>
        )}
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
            header={lang.tr('studio.flow.node.transitions')}
            currentFlow={props.flow}
            currentNodeName={node.name}
            subflows={props.subflows}
            onItemsUpdated={(items) => props.updateNode({ next: items })}
            copyItem={(item) => props.copyFlowNodeElement({ transition: item })}
            pasteItem={() => props.pasteFlowNodeElement('next')}
            canPaste={Boolean(props.buffer.transition)}
          />
        </Tab>
      </Tabs>
    </div>
  )
}
