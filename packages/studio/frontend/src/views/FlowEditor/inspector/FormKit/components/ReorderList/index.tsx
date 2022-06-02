import { Spinner } from '@blueprintjs/core'
import { FieldArray, useField } from 'formik'
import produce from 'immer'
import React, { FC, useState, useCallback } from 'react'
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd'

import { SuperInput, SiTypes } from '~/src/components/SuperInput'
import { Label, DynamicBtn, AddBtn, FormKitProps, FormKitLabelProps } from '../../shared'
import * as layout from '../../shared/styles/layout.module.scss'
import ListItem from './ListItem'
import * as style from './style.module.scss'

export type OwnProps = FormKitProps & FormKitLabelProps

const getRenderItem = (blocks: any, children: any) => (provided: any, snapshot: any, rubric: any) => {
  return (
    <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef} className={style.draggable}>
      <ListItem label={rubric.draggableId}>{children}</ListItem>
    </div>
  )
}

const ReorderList: FC<OwnProps> = ({ name, label, hint, placeholder, children }) => {
  const [field, { value }, { setValue }] = useField(name)
  const [isDynamic, setIsDynamic] = useState(false)
  const renderItem = getRenderItem(value, children)

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
          <Label className={layout.center} label={label} hint={hint} />
          <DynamicBtn className={layout.rightBtn} active={isDynamic} onClick={() => setIsDynamic(!isDynamic)} />
        </div>
        {!isDynamic ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={name} renderClone={renderItem}>
              {(provided: any, snapshot: any) => (
                <FieldArray name={name}>
                  {({ push }) => (
                    <div className={style.list}>
                      <div className={style.listHeader}>
                        {/* @TRANSLATE */}
                        <p>help part</p>
                        <AddBtn
                          onClick={() => {
                            // @TODO: fix reorderlist ticket
                            push('')
                          }}
                        />
                      </div>

                      <div className={style.listContainer} ref={provided.innerRef} {...provided.droppableProps}>
                        <div className={style.placeholderText}>{placeholder}</div>

                        {value === undefined ? (
                          //  @TRANSLATE
                          <Spinner className={style.loading} size={25}>
                            loading
                          </Spinner>
                        ) : value === null ? (
                          // @TODO: remove once onEnter and onReceive are merged
                          <div>checkbox wait for user</div>
                        ) : (
                          value.map((block, idx) => (
                            <Draggable key={block} draggableId={block} index={idx}>
                              {renderItem}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </FieldArray>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <SuperInput type={SiTypes.EXPRESSION} />
        )}
      </div>
    </>
  )
}

export default ReorderList
