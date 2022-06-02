import { NumericInput } from '@blueprintjs/core'
import React, { FC, useState } from 'react'
import cx from 'classnames'

import { SuperInput, SiTypes } from '~/src/components/SuperInput'

import { Label, DynamicBtn, FormKitProps, FormKitLabelProps } from '../../shared/'
import * as layout from '../../shared/styles/layout.module.scss'

import * as style from './style.module.scss'

export type OwnProps = FormKitProps & FormKitLabelProps

const NumberInput: FC<OwnProps> = ({ label, hint, placeholder, name }) => {
  const [isDynamic, setIsDynamic] = useState(false)
  // TODO: error boilerplate
  const error = false

  return (
    <div className={cx(layout.formKitContainer, { [style.error]: error })}>
      <div className={layout.labelSection}>
        <Label className={layout.center} label={label} hint={hint} />
        <DynamicBtn className={layout.rightBtn} active={isDynamic} onClick={() => setIsDynamic(!isDynamic)} />
      </div>
      {!isDynamic ? (
        <NumericInput className={style.input} allowNumericCharactersOnly={true} placeholder={placeholder} fill={true} />
      ) : (
        <SuperInput type={SiTypes.BOOL} />
      )}
    </div>
  )
}

export default NumberInput
