import { TextArea } from '@blueprintjs/core'
import { useField } from 'formik'
import React, { FC, useState } from 'react'

import { SuperInput, SiTypes } from '~/src/components/SuperInput'
import { Label, DynamicBtn, FormKitProps, FormKitLabelProps } from '../../shared'
import * as layout from '../../shared/styles/layout.module.scss'
import * as style from './style.module.scss'

export type OwnProps = FormKitProps & FormKitLabelProps

const TextInput: FC<OwnProps> = ({ label, hint, placeholder, name }) => {
  const [isDynamic, setIsDynamic] = useState(false)
  const [field, { value }, { setValue }] = useField(name)
  // TODO: error boilerplate
  const error = false

  return (
    <div className={layout.formKitContainer}>
      <div className={layout.labelSection}>
        <Label className={layout.center} label={label} hint={hint} />
        <DynamicBtn className={layout.rightBtn} active={isDynamic} onClick={() => setIsDynamic(!isDynamic)} />
      </div>
      {!isDynamic ? (
        <TextArea className={style.textInput} {...field} />
      ) : (
        <SuperInput
          type={SiTypes.TEMPLATE}
          value={value}
          onChange={(change) => {
            setValue(change)
          }}
        />
      )}
    </div>
  )
}

export default TextInput
