import { TextArea } from '@blueprintjs/core'
import React, { FC, useState } from 'react'

import { SuperInput, SiTypes } from '~/src/components/SuperInput'
import { useField } from 'formik'

import * as layout from '../../shared/layout.module.scss'

import { Label, DynamicBtn } from '../../shared'

import * as style from './style.module.scss'

interface OwnProps {
  label?: string
  hint?: string
  multi?: boolean
  req?: boolean
  help?: string
  placeholder?: string
  error?: boolean
  name: string
}

const TextInput: FC<OwnProps> = ({ label, hint, req, placeholder, help, error, multi, name }) => {
  const [isDynamic, setIsDynamic] = useState(false)
  const [field, { value }, { setValue }] = useField(name)

  return (
    <div className={layout.formKitContainer}>
      <div className={layout.labelSection}>
        <Label className={layout.center} label={label} hint={hint} required={req} />
        <DynamicBtn className={layout.rightBtn} active={isDynamic} onClick={() => setIsDynamic(!isDynamic)} />
      </div>
      {!isDynamic ? (
        multi ? (
          <TextArea className={style.textInput} {...field} />
        ) : (
          <input type="text" className={style.textInput} {...field} />
        )
      ) : (
        <SuperInput
          type={SiTypes.BOOL} 
          value={value}
          onChange={(change) => {
            setValue(change)
        }} />
      )}
    </div>
  )
}

export default TextInput