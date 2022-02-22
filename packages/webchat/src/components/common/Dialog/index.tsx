import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import cx from 'classnames'
import React, { FC } from 'react'

import * as style from './style.module.scss'

export interface DialogProps extends IDialogProps {
  onSubmit?: () => void
  children: JSX.Element | JSX.Element[]
  isOpen: boolean
  height?: number
  size?: 'sm' | 'md' | 'lg'
}

export const Wrapper: FC<DialogProps> = (props) => {
  let width = 500
  if (props.size === 'sm') {
    width = 360
  } else if (props.size === 'md') {
    width = 700
  } else if (props.size === 'lg') {
    width = 900
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    props.onSubmit?.()
  }

  return (
    <Dialog
      className={style.dialog}
      transitionDuration={0}
      canOutsideClickClose={false}
      enforceFocus={false}
      style={{ width, height: props.height }}
      {...props}
    >
      {props.onSubmit ? (
        <form className={style.form} onSubmit={onSubmit}>
          {props.children}
        </form>
      ) : (
        props.children
      )}
    </Dialog>
  )
}

export const Body = ({ children, className }: { children: JSX.Element | JSX.Element[]; className?: string }) => {
  return <div className={cx(Classes.DIALOG_BODY, Classes.UI_TEXT, style.dialogBody, className)}>{children}</div>
}

export const Footer = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  return (
    <div className={Classes.DIALOG_FOOTER}>
      <div className={Classes.DIALOG_FOOTER_ACTIONS}>{children}</div>
    </div>
  )
}
