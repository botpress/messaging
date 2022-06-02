import cx from 'classnames'
import React, { FC } from 'react'

import * as style from './style.module.scss'

interface OwnProps {
  show?: boolean
}

const Pane: FC<OwnProps> = ({ show, children }) => {
  return <div className={cx(style.paneLayout, { [style.hide]: !show })}>{children}</div>
}

export default Pane
