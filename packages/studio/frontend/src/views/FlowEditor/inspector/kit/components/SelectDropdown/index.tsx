import React, { FC, useState } from 'react'
import Select from 'react-select'

import { SuperInput, SiTypes } from '~/src/components/SuperInput'

import * as layout from '../../../styles/layout.module.scss'

import { Label, DynamicBtn } from '../../shared'

interface OwnProps {
  label?: string
  hint?: string
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
  label,
  hint,
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

  const customStyles = {}

  return (
    <div className={layout.paneItem}>
      <div className={layout.labelSection}>
        <Label className={layout.center} label={label} hint={hint} />
        <DynamicBtn className={layout.rightBtn} active={isDynamic} onClick={() => setIsDynamic(!isDynamic)} />
      </div>
      {!isDynamic ? (
        <Select
          style={customStyles}
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
