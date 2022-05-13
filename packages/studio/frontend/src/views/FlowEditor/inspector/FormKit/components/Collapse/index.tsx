import { Collapse as BpCollapse, Icon } from '@blueprintjs/core'
import React, { FC } from 'react'
import shallow from 'zustand/shallow'

import useFormKitStore from '../../store'
import * as style from './style.module.scss'

export type CollapseClick = (id: string, idx: number, event: React.MouseEvent) => void

interface OwnProps {
  idx: number
  label: string
}

const Collapse: FC<OwnProps> = ({ idx, label, children }) => {
  const [isActive, setActiveCollapse] = useFormKitStore(
    (state) => [state.activeCollapse === idx, state.setActiveCollapse],
    shallow
  )

  return (
    <>
      <div onClick={(e) => setActiveCollapse(idx)} className={style.form}>
        {isActive ? <Icon icon="chevron-down" size={20} /> : <Icon icon="chevron-up" size={20} />} {label}
      </div>
      <BpCollapse isOpen={isActive} keepChildrenMounted>
        {children}
      </BpCollapse>
    </>
  )
}

export default Collapse
