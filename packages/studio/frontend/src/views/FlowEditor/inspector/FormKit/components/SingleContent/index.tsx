import React, { FC, useState } from 'react'

import * as base from '~/src/scss/base/_index.module.scss'
import { Label, AddBtn, SwapIcon } from '../../shared'
import * as layout from '../../shared/styles/layout.module.scss'
import * as style from './style.module.scss'

interface OwnProps {
  name: string
  label?: string
  hint?: string
  req?: boolean
  help?: string
  placeholder?: string
  error?: boolean
}

// @TODO: finish component
const SingleContent: FC<OwnProps> = ({ name, label, hint, req, placeholder, error }) => {
  const content = <Item label="Text | welcome_msg" />

  const [isFull, setIsFull] = useState(false)
  const [isDynamic, setIsDynamic] = useState(false)

  const toggleDI = () => {
    setIsDynamic(!isDynamic)
  }

  return (
    <div className={layout.formKitContainer}>
      <Label label={label} hint={hint} required />

      {/* Well */}
      <div className={`${layout['well-row']}`} style={{ padding: 8 + 'px' }}>
        {/* Content */}
        <div className={`${base['w-full']}`}>
          {isFull ? content : <p className={`${style.placeholderText}`}>{placeholder}</p>}
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
          <AddBtn
            onClick={() => {
              setIsFull(true)
            }}
          />
        )}
      </div>
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
