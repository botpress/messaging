import cx from 'classnames'
import React, { FC } from 'react'

import * as style from './style.module.scss'

interface OwnProps {
  isHighlighed?: boolean
  isLarge?: boolean
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

const NodeWrapper: FC<OwnProps> = ({ children, isHighlighed, isLarge, onClick }) => (
  <div
    className={cx(style.nodeWrapper, { [style.highlighted]: isHighlighed, [style.large]: isLarge })}
    onContextMenu={(e) => {
      e.stopPropagation()
      e.preventDefault()
    }}
    onClick={onClick}
  >
    {children}
  </div>
)

export default NodeWrapper
