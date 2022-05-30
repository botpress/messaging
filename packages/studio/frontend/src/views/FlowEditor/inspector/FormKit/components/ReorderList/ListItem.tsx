import { Classes } from '@blueprintjs/popover2'
import cx from 'classnames'
import React, { FC } from 'react'

import { SidePane } from '../../../layout'
import * as style from './style.module.scss'

interface OwnProps {
  label: string
  error?: any
}

const ListItem: FC<OwnProps> = ({ label, error, children }) => {
  return (
    <SidePane
      // @TRANSLATE
      label="Edit Item"
      target={
        <div className={cx(Classes.POPOVER2_OPEN, style.listItem, { [style.itemError]: error })}>
          <span className={style.label}>{label}</span>
        </div>
      }
    >
      {children}
    </SidePane>
  )
}

export default ListItem
