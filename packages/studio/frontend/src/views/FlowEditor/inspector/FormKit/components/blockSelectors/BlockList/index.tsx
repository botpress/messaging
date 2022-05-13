import React, { FC } from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd'

import { Label, AddBtn, FormKitOnAction } from '../../../shared'
import * as layout from '../../../shared/layout.module.scss'
import Block from '../Block'

import * as style from './style.module.scss'

export enum BlockListActions {
  UPDATE = 'update',
  CREATE = 'create',
  DISABLE = 'disable'
}

enum BlockTypes {
  BLOCK = 'block'
}

export interface OwnProps {
  id: string
  value: any[]
  label: string
  hint?: string
  disableable?: boolean
  disableText?: string
  onAction?: FormKitOnAction<BlockListActions>
}

const getRenderItem = (blocks: any) => (provided: any, snapshot: any, rubric: any) => {
  return (
    <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
      <Block block={blocks[rubric.source.index]} onDoubleClick={console.log} grab />
    </div>
  )
}

const BlockList: FC<OwnProps> = ({ id, label, hint, value, disableable, disableText, onAction = () => {} }) => {
  const renderItem = getRenderItem(value)

  return (
    <div className={layout.formKitContainer}>
      <div className={layout.labelSection}>
        <Label className={layout.center} label={label} hint={hint} />
        <AddBtn className={layout.rightBtn} />
      </div>
      <Droppable droppableId={id} renderClone={renderItem}>
        {(provided: any, snapshot: any) => (
          <div className={style.container} ref={provided.innerRef} {...provided.droppableProps}>
            {value.map((block, idx) => (
              <Draggable draggableId={block} index={idx} key={block}>
                {renderItem}
              </Draggable>
            ))}
          </div>
        )}
      </Droppable>
    </div>
  )
}

export default BlockList
