import React, { forwardRef } from 'react'
import style from './EditorFrame.module.scss'
import { SafeInputGroupProps } from './types'

const EditorFrame = forwardRef<HTMLInputElement, { children: React.ReactNode } & SafeInputGroupProps>(
  ({ children, ...props }, ref) => {
    return (
      <div className={`bp3-input-group ${style.bpEditor}`}>
        {props.leftIcon && <span data-testid="left-icon" className={`bp3-icon bp3-icon-${props.leftIcon}`}></span>}
        <div className={`bp3-input ${style.bp3Input}`} ref={ref}>
          {children}
        </div>
        {props.rightElement}
      </div>
    )
  }
)

export default EditorFrame
