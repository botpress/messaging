import cx from 'classnames'
import React, { FC } from 'react'

import * as style from './style.module.scss'
import { EmptyStateProps } from './typings'

const EmptyState: FC<EmptyStateProps> = (props) => (
  <div className={cx(style.emptyState, props.className)}>
    {props.icon}
    <p>{props.text}</p>
  </div>
)

export default EmptyState
