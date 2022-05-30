import { Colors } from '@blueprintjs/core'
import React, { FC, useState } from 'react'
import Select from 'react-select'

import { SuperInput, SiTypes } from '~/src/components/SuperInput'
import { Label, DynamicBtn, FormKitProps, FormKitLabelProps } from '../../shared'
import * as layout from '../../shared/styles/layout.module.scss'

export type OwnProps = FormKitProps & FormKitLabelProps

const SelectDropdown: FC<OwnProps> = ({ name, label, hint, placeholder }) => {
  const [isDynamic, setIsDynamic] = useState(false)
  // TODO: error boilerplate
  const error = false

  // @TODO: move styles elsewhere
  const customStyles = {
    control: (provided) => ({
      ...provided,
      transition: 'all 75ms linear',
      minHeight: '36px',
      height: '36px',
      background: Colors.LIGHT_GRAY5,
      borderColor: Colors.LIGHT_GRAY2,
      '&:hover': {
        borderColor: Colors.GRAY5
      },
      '&:focus-within': {
        borderColor: '#0070f7',
        boxShadow: `0 0 0 1px ${Colors.COBALT5}`,
        background: 'white'
      },
      borderRadius: '6px',
      width: '100%'
    })
  }

  return (
    <div className={layout.formKitContainer}>
      <div className={layout.labelSection}>
        <Label className={layout.center} label={label} hint={hint} />
        <DynamicBtn className={layout.rightBtn} active={isDynamic} onClick={() => setIsDynamic(!isDynamic)} />
      </div>
      {!isDynamic ? <Select styles={customStyles} /> : <SuperInput type={SiTypes.BOOL} />}
    </div>
  )
}

export default SelectDropdown
