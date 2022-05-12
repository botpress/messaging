import { Tooltip, Position, PopoverInteractionKind } from '@blueprintjs/core'
import cx from 'classnames'
import React, { FC } from 'react'
import * as style from './style.module.scss'

export interface OwnProps {
  label: string
  hint?: string
  required?: boolean
  className?: string
}

const Label: FC<OwnProps> = ({ label, hint, required, className }) => {
  const fillLinks = (hintStr: string) => {
    const hintList = hintStr.split(/(\[.+\]\(.+\))/g)
    return hintList.map((token: string) => {
      const match = token.match(/\[(.*)\]\((.*)\)/)
      if (match) {
        return (
          <a className={style.externalLink} href={match[2]} target="_blank">
            {match[1]}
          </a>
        )
      }
      return token
    })
  }

  const LabelText = () => {
    return (
      <h4>
        <span className={cx({ [style.hint]: hint })}>{label}</span>
        {/* {hint && fillLink(hint)} */}
        {required && <span className={style.req}>&nbsp;*</span>}
      </h4>
    )
  }

  return (
    <div className={cx(style.label, className)}>
      {hint ? (
        <Tooltip
          // defaultIsOpen
          popoverClassName={style.tooltip}
          position={Position.TOP}
          interactionKind={PopoverInteractionKind.HOVER}
          content={<>{fillLinks(hint)}</>}
          hoverCloseDelay={200}
        >
          <LabelText />
        </Tooltip>
      ) : (
        <LabelText />
      )}
    </div>
  )
}

export default Label
