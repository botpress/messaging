import { EditableText } from '@blueprintjs/core'
import { useField } from 'formik'
import React, { FC } from 'react'

import { FormKitProps } from '../../shared'
import * as layout from '../../shared/styles/layout.module.scss'
import * as style from './style.module.scss'

interface OwnProps extends FormKitProps {
  type?: string
}

const EditableTextBlock: FC<OwnProps> = ({ type, placeholder, name }) => {
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
        onChange={(change) => {
          setValue(change)
        }}
      />
    </div>
  )
}

export default EditableTextBlock
