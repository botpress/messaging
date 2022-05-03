import cx from 'classnames'
import React, { useState, useEffect, useRef, RefObject, FC } from 'react'
import OptionDots from './OptionDots'
import style from './style.scss'

export enum OptionActions {
  DELETE = 'delete'
}

export type OptionOnAction = (action: OptionActions) => void

export interface OwnProps {
  onAction: OptionOnAction
  className?: string
}

const OptionMenu: FC<OwnProps> = ({ className, onAction }) => {
  const [active, setActive] = useState(false)
  const menuRef: RefObject<HTMLDivElement> = useRef(null)

  useEffect(() => {
    const clickListener = (event) => {
      if (event.target !== menuRef.current) {
        setActive(false)
      }
    }

    if (active) {
      window.addEventListener('click', clickListener)
    }

    return () => {
      window.removeEventListener('click', clickListener)
    }
  }, [active, setActive, menuRef])

  return (
    <div className={cx(style.container, className)}>
      <OptionDots
        onClick={() => {
          setActive(!active)
        }}
      />
      {active && (
        <div ref={menuRef} className={style.options}>
          <span
            className={style.delete}
            onClick={() => {
              onAction(OptionActions.DELETE)
            }}
          >
            Delete
          </span>
        </div>
      )}
    </div>
  )
}

export default OptionMenu
