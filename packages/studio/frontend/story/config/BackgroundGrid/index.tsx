import cx from 'classnames'
import React, { FC } from 'react'
// import { DndProvider } from 'react-dnd'
// import { HTML5Backend } from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-beautiful-dnd'

import style from './style.scss'

const BackgroundGrid: FC = ({ children }) => {
  return (
    <div className={style.backgroundGrid}>
      <DragDropContext>{children}</DragDropContext>
    </div>
  )
}

export default BackgroundGrid
