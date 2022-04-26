import { Classes, Dialog as BPDialog } from '@blueprintjs/core'
import cx from 'classnames'
import React, { FC } from 'react'

import style from './style.scss'
import { DialogProps } from './typings'

export const Wrapper: FC<DialogProps> = (props) => {
  let width: any
  if (props.size === 'sm') {
    width = 360
  } else if (props.size === 'md') {
    width = 700
  } else if (props.size === 'lg') {
    width = 900
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const target = e.target as HTMLFormElement
    if (!props.id || props.id === target.id) {
      props.onSubmit!()
    }
  }

  return (
    <BPDialog
      className={style.dialog}
      transitionDuration={0}
      canOutsideClickClose={false}
      canEscapeKeyClose
      enforceFocus={false}
      style={{ width, height: props.height }}
      {...props}
    >
      {props.onSubmit ? (
        <form id={props.id} onSubmit={onSubmit}>
          {props.children}
        </form>
      ) : (
        props.children
      )}
    </BPDialog>
  )
}

export const Body = ({ children, className }: { children: any; className?: string }) => {
  return <div className={cx(Classes.DIALOG_BODY, Classes.UI_TEXT, style.dialogBody, className)}>{children}</div>
}

export const Footer = ({ children }) => {
  return (
    <div className={Classes.DIALOG_FOOTER}>
      <div className={Classes.DIALOG_FOOTER_ACTIONS}>{children}</div>
    </div>
  )
}

export const Dialog = { Wrapper, Footer, Body }
