import cx from 'classnames'
import React, { FC } from 'react'

import BackgroundGrid from '../BackgroundGrid'
import style from './style.scss'

interface OwnProps {
  center?: boolean
}

const InspectorWindow: FC<OwnProps> = ({ center, children }) => {
  return (
    <BackgroundGrid>
      <div className={style.container}>
        <div className={style.inspector}>{children}</div>
      </div>
    </BackgroundGrid>
  )
}

export default InspectorWindow
