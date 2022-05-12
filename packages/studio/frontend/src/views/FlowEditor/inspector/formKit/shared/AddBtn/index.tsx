import { Icon } from '@blueprintjs/core'
import cx from 'classnames'
import React, { FC } from 'react'
import * as style from './style.module.scss'

export interface OwnProps {
  onClick?: () => void
  className?: string
}

const AddBtn: FC<OwnProps> = ({ className, onClick = () => {} }) => {
  return (
    <div className={cx(style.btn, className)} onClick={onClick}>
      <Icon icon="plus" />
    </div>
  )
}

export default AddBtn
