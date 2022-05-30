import { Spinner } from '@blueprintjs/core'
import cx from 'classnames'
import { useField } from 'formik'
import produce from 'immer'
import React, { useCallback, FC } from 'react'
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd'

import { Label, AddBtn, FormKitProps, FormKitLabelProps } from '../../../shared'
import * as layout from '../../../shared/styles/layout.module.scss'
import Block from '../Block'
import BlockSidePane from '../BlockSidePane'
import * as style from './style.module.scss'

export type OwnProps = FormKitProps & FormKitLabelProps

const getRenderItem = (blocks: any) => (provided: any, snapshot: any, rubric: any) => {
  return (
    <div
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
      className={cx(style.draggable)}
    >
      <Block block={blocks[rubric.source.index]} {...snapshot} />
    </div>
  )
}

const BlockList: FC<OwnProps> = ({ name, label, hint }) => {
  const [field, { value }, { setValue }] = useField(name)
  const renderItem = getRenderItem(value)

  const handleDragEnd = useCallback(
    (result) => {
      const { source, destination } = result

      if (!destination) {
        return
      }

      setValue(
        produce(value, (draft) => {
          draft.splice(destination.index, 0, draft.splice(source.index, 1)[0])
        })
      )
    },
    [value, setValue]
  )

  return (
    <div className={layout.formKitContainer}>
      <BlockSidePane name={name}>
        <div className={layout.labelSection}>
          <Label className={layout.center} label={label} hint={hint} />
          <AddBtn className={layout.rightBtn} />
        </div>
      </BlockSidePane>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={name} renderClone={renderItem}>
          {(provided: any, snapshot: any) => (
            <div className={style.container} ref={provided.innerRef} {...provided.droppableProps}>
              {value === undefined ? (
                //  @TRANSLATE
                <Spinner className={style.loading} size={25}>
                  loading
                </Spinner>
              ) : value === null ? (
                // @TODO: remouve when merging onEnter and onReceive
                <div>checkbox wait for user</div>
              ) : (
                value.map((block, idx) => (
                  <Draggable draggableId={block} index={idx} key={block}>
                    {renderItem}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

export default BlockList
