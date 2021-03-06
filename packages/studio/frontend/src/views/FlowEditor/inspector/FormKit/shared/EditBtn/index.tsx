import { Icon } from '@blueprintjs/core'
import cx from 'classnames'
import React, { FC } from 'react'
import * as style from './style.module.scss'

export interface OwnProps {
  onClick?: () => void
  className?: string
}

const EditBtn: FC<OwnProps> = ({ className, onClick = () => {} }) => {
  return (
    <div className={cx(style.btn, className)} onClick={onClick}>
      <Icon icon="edit" />
    </div>
  )
}

export default EditBtn
