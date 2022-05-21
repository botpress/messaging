import { Spinner } from '@blueprintjs/core'
import { useField } from 'formik'
import produce from 'immer'
import React, { useCallback, FC } from 'react'
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd'

import { Label, AddBtn } from '../../../shared'
import * as layout from '../../../shared/layout.module.scss'
import Block from '../Block'

import * as style from './style.module.scss'

export interface OwnProps {
  name: string
  label: string
  hint?: string
}

const getRenderItem = (blocks: any) => (provided: any, snapshot: any, rubric: any) => {
  return (
    <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef} className={style.draggable}>
      <Block block={blocks[rubric.source.index]} />
    </div>
  )
}

const BlockList: FC<OwnProps> = ({ name, label, hint }) => {
  const [field, { value }, { setValue }] = useField(name)
  const renderItem = getRenderItem(value)

  const handleDragEnd = useCallback(
    (result) => {
      const { source, destination } = result
      // dropped outside the list
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
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={layout.formKitContainer}>
        <div className={layout.labelSection}>
          <Label className={layout.center} label={label} hint={hint} />
          <AddBtn className={layout.rightBtn} />
        </div>
        <Droppable droppableId={name} renderClone={renderItem}>
          {(provided: any, snapshot: any) => (
            <div
              className={style.container}
              // style={{ minHeight: `${BLOCK_HEIGHT_PX * value.length}px` }}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {value === undefined ? (
                <Spinner className={style.loading} size={50}>
                  loading
                </Spinner>
              ) : value === null ? (
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
      </div>
    </DragDropContext>
  )
}

export default BlockList
