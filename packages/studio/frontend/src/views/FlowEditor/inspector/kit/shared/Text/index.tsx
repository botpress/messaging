import cx from 'classnames'
import React, { FC } from 'react'
import style from './style.scss'

export enum TextIntents {
  DEFAULT = 'default',
  LITE = 'lite',
  PLACEHOLDER = 'placeholder',
  LITE_PLACEHOLDER = 'lite-placeholder'
}

export interface OwnProps {
  value: string
  intent?: TextIntents
  large?: boolean
  className?: string
}

const Text: FC<OwnProps> = ({ value, className, intent = TextIntents.DEFAULT, large }) => {
  return <div className={cx(style.common, style[intent], { [style.large]: large }, className)}>{value}</div>
}

export default Text
