import { Collapse as BpCollapse, Icon } from '@blueprintjs/core'
import React, { FC } from 'react'

import * as style from './style.module.scss'

export type CollapseClick = (id: string, idx: number, event: React.MouseEvent) => void

interface OwnProps {
  id: string
  label: string
  idx?: number
  isActive?: boolean
  onClick?: CollapseClick
}

const Collapse: FC<OwnProps> = ({ id, label, idx = 0, isActive = false, onClick = () => {}, children }) => {
  return (
    <>
      <div onClick={(e) => onClick(id, idx, e)} className={style.form}>
        {isActive ? <Icon icon="chevron-down" size={20} /> : <Icon icon="chevron-up" size={20} />} {label}
      </div>
      <BpCollapse isOpen={isActive} keepChildrenMounted>
        {children}
      </BpCollapse>
    </>
  )
}

export default Collapse
