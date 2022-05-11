import { EditableText } from '@blueprintjs/core'
import React, { FC } from 'react'

import * as layout from '../../../styles/layout.module.scss'

import * as style from './style.module.scss'

interface OwnProps {
  type?: string
  placeholder?: string
  error?: boolean
}

const EditableTextBlock: FC<OwnProps> = ({ type, placeholder, error }) => {
  return (
    <div className={`${layout.paneItem}`}>
      <EditableText
        alwaysRenderInput={false}
        multiline={true}
        minLines={1}
        maxLines={4}
        placeholder={placeholder}
        className={`${type === 'title' ? style['editable-title'] : style['editable-text']}`}
      />
    </div>
  )
}

export default EditableTextBlock
