import { Icon } from '@blueprintjs/core'
import React, { FC } from 'react'

import style from './style.scss'

export type TabOnClick = (id: string, idx: number, event: React.MouseEvent) => void

interface OwnProps {
  id: string
  label: string
  idx?: number
  onClick?: TabOnClick
  onDelete?: any
  active?: boolean
}

const Tab: FC<OwnProps> = ({ id, idx = 0, label, active = false, onClick = () => {}, onDelete = () => {} }) => {
  return (
    <div onClick={(e) => onClick(id, idx, e)} className={style.tab} aria-active={active}>
      {label}
      {idx > 0 && active && <Icon icon="cross" onClick={(e) => onDelete(id, idx, e)} />}
    </div>
  )
}

export default Tab
