import React from 'react'

import * as style from './style.module.scss'

const requireFlag = (code: string) => {
  try {
    // @ts-ignore
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
