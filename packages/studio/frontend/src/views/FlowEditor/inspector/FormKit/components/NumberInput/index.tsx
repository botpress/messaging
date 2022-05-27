import { NumericInput } from '@blueprintjs/core'
import React, { FC, useState } from 'react'

import { SuperInput, SiTypes } from '~/src/components/SuperInput'

import { Label, DynamicBtn } from '../../shared/'
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

const NumberInput: FC<OwnProps> = ({ label, hint, req, placeholder, help, error, name }) => {
  const [isDynamic, setIsDynamic] = useState(false)

  return (
    <div className={`${layout.formKitContainer} ${error ? style.error : ''}`}>
      <div className={layout.labelSection}>
        <Label className={layout.center} label={label} hint={hint} required />
        <DynamicBtn className={layout.rightBtn} active={isDynamic} onClick={() => setIsDynamic(!isDynamic)} />
      </div>
      {!isDynamic ? (
        <NumericInput
          className={style.input}
          allowNumericCharactersOnly={true}
          placeholder="enter number"
          fill={true}
        />
      ) : (
        <SuperInput type={SiTypes.BOOL} />
      )}
    </div>
  )
}

export default NumberInput