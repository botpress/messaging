import React from 'react'

import style from './style.scss'

const requireFlag = (code: string) => {
  try {
    return require(`../../../img/flags/${code}.svg`)
  } catch (err) {
    return requireFlag('missing')
  }
}

interface Props {
  languageCode: string
}

export const Flag = (props: Props) => (
  <img src={requireFlag(props.languageCode)} alt={props.languageCode} className={style.flag} />
)
