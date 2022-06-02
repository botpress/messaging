import { Icon } from '@blueprintjs/core'
import cx from 'classnames'
import React, { useRef, FC, useEffect } from 'react'
import shallow from 'zustand/shallow'

import useInspectorStore from '../../store'
import * as style from './style.module.scss'

interface OwnProps {
  idx: number
}

const Tab: FC<OwnProps> = ({ idx, children }) => {
  const tabRef = useRef(null)
  const [isActive, changeTab, closeTabIdx] = useInspectorStore(
    (state) => [state.activeTabIdx === idx, state.changeTab, state.closeTabIdx],
    shallow
  )

  useEffect(() => {
    if (isActive && idx !== -1) {
      tabRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
    }
  }, [isActive])

  return (
    <div onClick={() => changeTab(idx)} className={cx(style.tab, { [style.tab__active]: isActive })} ref={tabRef}>
      {children}
      {idx > -1 && isActive && (
        <Icon
          icon="cross"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            closeTabIdx(idx)
          }}
        />
      )}
    </div>
  )
}

export default Tab
