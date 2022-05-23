import { Colors } from "@blueprintjs/core";
import React, { FC, useState } from 'react'
import Select from 'react-select'

import { SuperInput, SiTypes } from '~/src/components/SuperInput'

import * as layout from '../../shared/layout.module.scss'
import * as style from './style.module.scss'

import { Label, DynamicBtn } from '../../shared'
import { styleTags } from '@codemirror/highlight'

interface OwnProps {
  name: string
  label?: string
  hint?: string
  req?: boolean,
  placeholder?: string
  error?: boolean
  options?: Array<Record<string, string>>
  defaultValue?: any
  isDisabled?: boolean
  isLoading?: boolean
  isClearable?: boolean
  isRtl?: boolean
  isSearchable?: boolean
}

const SelectDropdown: FC<OwnProps> = ({
  name,
  label,
  hint,
  req,
  placeholder,
  error,
  options,
  defaultValue,
  isDisabled,
  isLoading,
  isClearable,
  isRtl,
  isSearchable
}) => {
  const [isDynamic, setIsDynamic] = useState(false)

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '36px',
      height: '36px',
      background: Colors.LIGHT_GRAY5,
      borderColor:  Colors.LIGHT_GRAY2,
      '&:hover': {
        borderColor:  Colors.GRAY5
      },
      '&:focus-within': {
        borderColor: '#0070f7',
        boxShadow: `0 0 0 1px ${Colors.COBALT5}`,
        background: 'white'
      },
      borderRadius: '6px',
      width: '100%',
    }),
  }


  return (
    <div className={layout.formKitContainer}>
      <div className={layout.labelSection}>
        <Label className={layout.center} label={label} hint={hint} required={req} />
        <DynamicBtn className={layout.rightBtn} active={isDynamic} onClick={() => setIsDynamic(!isDynamic)} />
      </div>
      {!isDynamic ? (
        <Select
          styles={customStyles}
          options={options}
          defaultValue={defaultValue}
          isDisabled={isDisabled}
          isLoading={isLoading}
          isClearable={isClearable}
          isRtl={isRtl}
          isSearchable={isSearchable}
        />
      ) : (
        <SuperInput type={SiTypes.BOOL} />
      )}
    </div>
  )
}

export default SelectDropdown