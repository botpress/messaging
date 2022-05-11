import React, { FC, useState } from 'react'

import * as layout from '../../../styles/layout.module.scss'

import AddIcon from '../../shared/AddBtn'
import Grabber from '../../shared/Grabber'
import Label from '../../shared/Label'
import Ellipsis from '../../shared/OptionMenu'

import * as style from './style.module.scss'

interface OwnProps {
  label?: string
  hint?: string
  req?: boolean
  help?: string
  placeholder?: string
  error?: boolean
}

const List: FC<OwnProps> = ({ label, hint, req, help, placeholder, error }) => {
  function add(): any {
    console.log('ADD')
  }

  return (
    <div className={`${layout.paneItem}`}>
      {/* Label, tooltip on hover, required | super input */}
      <Label label="WOWOW" hint="hello this is what help looks like. [View Doc](https://google.com)" required />
      {/* Container */}
      <div className={style.list}>
        {/* Message Box and plus button */}
        <div className={style.listHeader}>
          <p>{help}</p>
          <AddIcon
            error={error ? true : false}
            onClick={() => {
              add()
            }}
          />
        </div>

        {/* Message Container */}
        <div className={style.listContainer}>
          <div className={style.placeholderText}>{placeholder}</div>
          <ListItem label="HIHI" error={false} />
          <ListItem label="WOWOW" error={false} />
        </div>
      </div>

      {/* 1 message required  */}
    </div>
  )
}

const ListItem: FC<OwnProps> = ({ label, error }) => {
  const [isHover, setIsHover] = useState(false)

  return (
    <div
      className={`${style.listItem} ${error ? style.itemError : ''} ${isHover && error ? style.errorShadow : ''}`}
      onMouseEnter={() => {
        setIsHover(true)
      }}
      onMouseLeave={() => {
        setIsHover(false)
      }}
    >
      <Grabber error={error} />
      {/* Label */}
      <span className={style.label}>{label}</span>
      {/* Options */}
      <Ellipsis />
    </div>
  )
}

export default List
