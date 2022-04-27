import cx from 'classnames'
import React, { FC, Fragment } from 'react'

import Overlay from '../Overlay'
import MoreOptionsMenu from './MoreOptionsMenu'

import style from './style.scss'
import { MoreOptionsProps } from './typings'

const MoreOptions: FC<MoreOptionsProps> = (props) => {
  const { show, onToggle, element } = props

  const handleToggle = (e) => {
    e.stopPropagation()
    onToggle(!show)
  }

  const el = (
    <Fragment>
      {!element && (
        <button
          onClick={handleToggle}
          type="button"
          className={cx(style.moreBtn, 'more-options-btn', { [style.active]: show })}
        >
          <span className={style.moreBtnDots}></span>
        </button>
      )}
      {element}
      {show && <MoreOptionsMenu {...props} />}
      {show && <Overlay onClick={handleToggle} />}
    </Fragment>
  )

  return props.wrapInDiv ? <div className={style.moreOptionsWrapper}>{el}</div> : el
}

export default MoreOptions
