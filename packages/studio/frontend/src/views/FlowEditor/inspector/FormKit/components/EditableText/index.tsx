import { EditableText } from '@blueprintjs/core'
import React, { FC } from 'react'
import { useField } from 'formik'

import * as layout from '../../shared/layout.module.scss'

import * as style from './style.module.scss'

interface OwnProps {
  name: string
  type?: string
  placeholder?: string
  error?: boolean
}

const EditableTextBlock: FC<OwnProps> = ({ type, placeholder, error, name }) => {
  const [field, { value }, { setValue }] = useField(name)

  return (
    <div className={layout.formKitContainer}>
      <EditableText
        alwaysRenderInput={false}
        multiline={type === 'title' ? false : true}
        minLines={1}
        maxLines={4}
        placeholder={placeholder}
        className={type === 'title' ? style.editable__title : style.editable__text}
        value={value}
        onChange={
          (change) => {
            setValue(change)
          }
        }
      />
    </div>
  )
}

export default EditableTextBlock