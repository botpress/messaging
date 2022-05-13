import React, { useState, useCallback, FC, useEffect } from 'react'

import * as style from './style.module.scss'

export type FormOnClick = (id: string, idx: number, event: React.MouseEvent) => void

interface OwnProps {
  onUpdate?: any
}

const FormKitContext: FC<OwnProps> = ({ children, onUpdate }) => {
  const [selectedForm, setSelectedForm] = useState(0)

  const handleFormCollapseClick: FormOnClick = useCallback(
    (id, idx, e) => {
      setSelectedForm(idx)
      onUpdate(id)
    },
    [setSelectedForm, onUpdate]
  )

  useEffect(() => {
    setSelectedForm(0)
  }, [children])

  return (
    <div className={style.forms}>
      {React.Children.map(children, (child, idx) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { isActive: selectedForm === idx, idx, onClick: handleFormCollapseClick })
        }
      })}
    </div>
  )
}

export default FormKitContext
