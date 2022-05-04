import cx from 'classnames'
import React, { FC } from 'react'
import * as style from './style.module.scss'

export interface OwnProps {
  onClick?: () => void
  className?: string
}

const OptionDots: FC<OwnProps> = ({ className, onClick }) => {
  return (
    <div className={cx(style.optionDots, className)} onClick={onClick}>
      <svg width="20" height="4" viewBox="0 0 20 4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="2" cy="2" r="2" fill="currentColor" />
        <circle cx="10" cy="2" r="2" fill="currentColor" />
        <circle cx="18" cy="2" r="2" fill="currentColor" />
      </svg>
    </div>
  )
}

export default OptionDots
