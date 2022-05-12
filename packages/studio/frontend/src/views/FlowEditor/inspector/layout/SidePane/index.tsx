import { Portal } from '@blueprintjs/core'
import React, { useState, FC } from 'react'

import * as style from './style.module.scss'

const SIDEPANE_PORTAL_ID = 'SIDEPANE-PORTAL'

export interface OwnProps {
  onChange?: any
}

const SidePanePortal: FC<OwnProps> = ({ children, onChange }) => {
  const [selectedTab, setSelectedTab] = useState(0)

  return <Portal></Portal>
}

const SidePaneContainer: FC = ({ children }) => {
  return <div id={SIDEPANE_PORTAL_ID} className={style.container}></div>
}

export { SidePanePortal, SidePaneContainer }
