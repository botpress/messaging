import { Spinner } from '@blueprintjs/core'
import { useField } from 'formik'
import produce from 'immer'
import React, { FC, useState, useCallback } from 'react'
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd'
import { SuperInput, SiTypes } from '~/src/components/SuperInput'

import { Label, DynamicBtn } from '../../shared/'
import AddBtn from '../../shared/AddBtn'

import * as layout from '../../shared/styles/layout.module.scss'

import * as style from './style.module.scss'

interface OwnProps {
  name: string
  label?: string
  hint?: string
  req?: boolean
  help?: string
  placeholder?: string
  error?: boolean
}

const ListItem: FC<OwnProps> = ({ label, error }) => {
  const [isHover, setIsHover] = useState(false)

  return (
    <div
      className={`${style.listItem} ${error ? style.itemError : ''} ${isHover && error ? style.errorShadow : ''}`}
      onMouseEnter={() => {
        setIsHover(true)
      }}
      onMouseLeave={() => {
        setIsHover(false)
      }}
    >
      {/* Label */}
      <span className={style.label}>{label}</span>
    </div>
  )
}

const getRenderItem = (blocks: any) => (provided: any, snapshot: any, rubric: any) => {
  const [isHover, setIsHover] = useState(false)

  return (
    <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef} className={style.draggable}>
      {/* <Block block={blocks[rubric.source.index]} /> */}

      <ListItem name="asdf" label="HIHI" />
    </div>
  )
}

const ReorderList: FC<OwnProps> = ({ name, label, hint, req, help, placeholder, error }) => {
  const [field, { value }, { setValue }] = useField(name)
  const [isDynamic, setIsDynamic] = useState(false)
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
    <>
      <div className={layout.formKitContainer}>
        <div className={layout.labelSection}>
          <Label className={layout.center} label={label} hint={hint} required={req} />
          <DynamicBtn className={layout.rightBtn} active={isDynamic} onClick={() => setIsDynamic(!isDynamic)} />
        </div>
        {!isDynamic ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={name} renderClone={renderItem}>
              {(provided: any, snapshot: any) => (
                <div className={style.list}>
                  {/* Message Box and plus button */}
                  <div className={style.listHeader}>
                    <p>{help}</p>
                    <AddBtn
                      onClick={() => {
                        console.log('asdf')
                      }}
                    />
                  </div>

                  {/* Message Container */}
                  <div className={style.listContainer} ref={provided.innerRef} {...provided.droppableProps}>
                    <div className={style.placeholderText}>{placeholder}</div>
                    {/* <ListItem label="HIHI" error={false} /> */}

                    {/* <div
                    className={style.container}
                    // style={{ minHeight: `${BLOCK_HEIGHT_PX * value.length}px` }}
                  > */}
                    <ListItem name="asdf" label="HIHI" />
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
                    {/* </div> */}
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <SuperInput type={SiTypes.BOOL} />
        )}
      </div>
    </>
  )
}

export default ReorderList
