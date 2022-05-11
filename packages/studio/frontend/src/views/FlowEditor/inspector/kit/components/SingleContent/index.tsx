import React, { FC, useState } from 'react'

import * as base from '~/src/scss/base/_index.module.scss'

import * as form from '../../../styles/form.module.scss'
import * as layout from '../../../styles/layout.module.scss'

import Add from '../../shared/AddBtn'
import Label from '../../shared/Label'
import SwapIcon from '../../shared/SwapIcon'

import * as style from './style.module.scss'

interface OwnProps {
  label?: string
  hint?: string
  req?: boolean
  help?: string
  placeholder?: string
  error?: boolean
}

const SingleContent: FC<OwnProps> = ({ label, hint, req, placeholder, error }) => {
  function add(): void {
    console.log('ADD')
  }

  const content = <Item label="Text | welcome_msg" />

  const [isFull, setIsFull] = useState(false)
  const [isDynamic, setIsDynamic] = useState(false)

  const toggleDI = () => {
    setIsDynamic(!isDynamic)
    console.log('lOL')
  }

  return (
    <div className={`${layout.paneItem} ${error ? style.error : ''}`}>
      {/* Label, tooltip on hover, required | super input */}
      <Label label="Message" hint="hello this is what help looks like. [View Doc](https://google.com)" required />

      {/* Well */}
      {/* {isDynamic ? ( */}
      <div className={`${form['well-row']}`} style={{ padding: 8 + 'px' }}>
        {/* Content */}
        <div className={`${base['w-full']}`}>
          {isFull ? content : null}
          {/* Only shows when only child */}
          <p className={`${style.placeholderText}`}>{placeholder}</p>
        </div>
        {/* Button */}

        {isFull ? (
          <SwapIcon
            error={error ? true : false}
            onClick={() => {
              setIsFull(false)
            }}
          />
        ) : (
          <Add
            error={error ? true : false}
            onClick={() => {
              setIsFull(true)
            }}
          />
        )}
      </div>
      {/* ) : (
        <input type="text" className={`${form['text-input]'}`} />
      )} */}
    </div>
  )
}

interface ItemProps {
  label: string
}

const Item = ({ label }: ItemProps) => {
  return <div className={`${style.item}`}>{label}</div>
}

export default SingleContent
