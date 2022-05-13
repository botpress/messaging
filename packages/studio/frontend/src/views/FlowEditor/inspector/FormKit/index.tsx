import React, { useEffect, FC } from 'react'

import useFormKitStore from './store'
import * as style from './style.module.scss'

interface OwnProps {
  form: any
}

const FormKit: FC<OwnProps> = ({ form, children }) => {
  const resetKit = useFormKitStore((state) => state.resetKit)

  useEffect(() => {
    return () => resetKit()
  })

  return <div className={style.forms}>{children}</div>
}

export default FormKit
export * from './components'
