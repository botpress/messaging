import cx from 'classnames'
import React, { FC } from 'react'

import * as style from './style.module.scss'

interface Props {
  onEdit: () => void
  className?: string
  children: any
}

const NodeContentItem: FC<Props> = ({ onEdit, className, children }) => {
  return (
    <button className={cx('content-wrapper', style.contentWrapper, className)} onClick={onEdit}>
      {children}
    </button>
  )
}

export default NodeContentItem
