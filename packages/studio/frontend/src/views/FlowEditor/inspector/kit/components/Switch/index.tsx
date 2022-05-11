import { Switch as BpSwitch } from '@blueprintjs/core'
import React, { useEffect, useState, useMemo, FC } from 'react'
import { SuperInput, SiTypes } from '~/src/components/SuperInput'
import * as layout from '../../../styles/layout.module.scss'
import { Label, DynamicBtn } from '../../shared'

export interface OwnProps {
  id: string
  label: string
  hint?: string
  value: string
  onChange?: any
}

const Switch: FC<OwnProps> = ({ id, label, hint, value, onChange }) => {
  const [isDynamic, setIsDynamic] = useState(true)

  const _isBool = (token: string) => {
    try {
      const parseToken = JSON.parse(value)
      if (typeof parseToken === 'boolean') {
        return parseToken
      }
    } catch {}
    return null
  }

  const valueBool = useMemo(() => _isBool(value), [value])

  useEffect(() => {
    if (valueBool === null) {
      setIsDynamic(false)
    }
  }, [])

  return (
    <div className={layout.formKitContainer}>
      <div className={layout.labelSection}>
        {!isDynamic && (
          <BpSwitch
            className={layout.leftBtn}
            checked={valueBool}
            disabled={valueBool === null}
            large
            onChange={(event) => {
              onChange(id, (event.target as HTMLInputElement).checked ? 'true' : 'false')
            }}
          />
        )}
        <Label className={layout.center} label={label} hint={hint} />
        <DynamicBtn className={layout.rightBtn} active={isDynamic} onClick={() => setIsDynamic(!isDynamic)} />
      </div>
      {isDynamic && (
        <SuperInput
          type={SiTypes.BOOL}
          value={value}
          onChange={(change) => {
            onChange(id, change)
          }}
        />
      )}
    </div>
  )
}

export default Switch
