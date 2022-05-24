import { Icon } from '@blueprintjs/core'
import { Classes, Popover2 } from '@blueprintjs/popover2'
import cx from 'classnames'
import React, { FC } from 'react'

import * as style from './style.module.scss'

export interface OwnProps {
  target: any
  offsetX?: number
  label: any
  onClose?: () => void
}
const SidePane: FC<OwnProps> = ({ target, label, onClose, offsetX = 20, children }) => {
  return (
    <Popover2
      interactionKind="click"
      placement="left"
      minimal
      usePortal={false}
      onClose={onClose}
      transitionDuration={0}
      modifiers={{ offset: { enabled: true, options: { offset: [0, offsetX] } } }}
      content={
        <div className={style.sidePane}>
          <div className={style.head}>
            <h4>{label}</h4>
            <div className={cx(Classes.POPOVER2_DISMISS, style.closeBtn)}>
              <Icon size={18} icon="cross" />
            </div>
          </div>
          <div className={style.body}>{children}</div>
        </div>
      }
    >
      {target}
    </Popover2>
  )
}

export default SidePane
