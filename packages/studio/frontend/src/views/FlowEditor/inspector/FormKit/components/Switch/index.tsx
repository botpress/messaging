import { Switch as BpSwitch } from '@blueprintjs/core'
import { useField } from 'formik'
import React, { useState, useMemo, FC, useEffect } from 'react'
import { SuperInput, SiTypes } from '~/src/components/SuperInput'
import { Label, DynamicBtn } from '../../shared'
import * as layout from '../../shared/styles/layout.module.scss'
import * as style from './style.module.scss'

export interface OwnProps {
  name: string
  label: string
  hint?: string
}

const Switch: FC<OwnProps> = ({ label, name, hint }) => {
  const [isDynamic, setIsDynamic] = useState(false)

  const [field, { value }, { setValue }] = useField(name)

  const _isBool = (token: string) => {
    try {
      const parseToken = JSON.parse(token)
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
            className={style.switch}
            id={style.check}
            checked={valueBool}
            disabled={valueBool === null}
            onChange={(event) => {
              setValue((event.target as HTMLInputElement).checked ? 'true' : 'false')
            }}
            large
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
            setValue(change)
          }}
        />
      )}
    </div>
  )
}

export default Switch
