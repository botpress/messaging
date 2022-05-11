import cx from 'classnames'
import React, { FC, useState } from 'react'

import * as base from '~/src/scss/base/_index.module.scss'
import * as form from '../../../styles/form.module.scss'
import * as layout from '../../../styles/layout.module.scss'

import Grabber from '../../shared/Grabber'
import Label from '../../shared/Label'

import * as style from './style.module.scss'

interface OwnProps {
  label?: string
  hint?: string
  req?: boolean
  placeholder?: string
  error?: boolean
}

const ContentList: FC<OwnProps> = ({ label, hint, req, placeholder, error }) => {
  function add(): void {
    console.log('ADD')
  }

  const content = <ListItem label="Text | welcome_msg" />
  const [isFull, setIsFull] = useState(false)

  return (
    <div className={`${layout.paneItem}`}>
      {/* Label, tooltip on hover, required | super input */}
      {/* <div className={layout.labelSection}> */}
      <Label label="WOWOW" hint="hello this is what help looks like. [View Doc](https://google.com)" required />
      {/* <DynamicBtn className={layout.rightBtn} />  */}
      {/* </div> */}
      {/* Well */}
      <div className={`${form['well-column']}`}>
        {/* Content */}
        <ListItem label="Text | welcome_msg" />
        <ListItem label="Text | welcome_msg" />
        <ListItem label="Text | welcome_msg" />
        {/* Only shows when only child */}
        <p className={style.placeholderText}>{placeholder}</p>
      </div>
    </div>
  )
}

interface ItemProps {
  label: string
}

const ListItem: FC<OwnProps> = ({ label, error }) => {
  const [isHover, setIsHover] = useState(false)
  const [hGrabber, setHGrabber] = useState(false)

  const hoverGrabber = (hovered: boolean) => {
    setHGrabber(hovered)
  }

  return (
    <div
      className={`${style.listItem} ${error ? style.itemError : ''} ${isHover && error ? style.errorShadow : ''} ${
        hGrabber ? style.bgLightGray1 : ''
      }`}
    >
      <Grabber error={error} handleHover={hoverGrabber} />

      {/* Content */}
      <span
        onMouseEnter={() => {
          setIsHover(true)
        }}
        onMouseLeave={() => {
          setIsHover(false)
        }}
        className={`${style.item}`}
      >
        {/* Label */}
        <div className={cx(style.normal, base['w-full'])}>{label}</div>
      </span>
    </div>
  )
}

export default ContentList
