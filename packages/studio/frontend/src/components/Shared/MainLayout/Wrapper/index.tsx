import cx from 'classnames'
import React, { FC } from 'react'

import * as style from './style.module.scss'
import { WrapperProps } from './typings'

const Wrapper: FC<WrapperProps> = (props) => {
  const { childRef, children } = props
  return (
    <div id="main-content-wrapper" ref={(ref) => childRef?.(ref)} className={cx(style.wrapper, props.className)}>
      {...children}
    </div>
  )
}

export default Wrapper
