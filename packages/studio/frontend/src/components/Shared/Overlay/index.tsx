import React, { FC } from 'react'

import * as style from './style.module.scss'
import { OverlayProps } from './typings'

const Overlay: FC<OverlayProps> = ({ onClick, onContextMenu }) => (
  <div
    onContextMenu={(e) => {
      e.preventDefault()
      e.persist()

      if (!onContextMenu) {
        onClick(e)

        return
      }

      onContextMenu(e)
    }}
    className={style.overlay}
    onClick={onClick}
  ></div>
)

export default Overlay
