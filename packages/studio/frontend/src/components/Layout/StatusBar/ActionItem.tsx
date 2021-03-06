import classNames from 'classnames'
import _ from 'lodash'
import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

import * as sharedStyle from '../TopNav/style.module.scss'
import * as style from './style.module.scss'

const titleToId = (txt: string) => txt.replace(/[^\W]/gi, '_')

interface Props {
  title: string
  shortcut?: any
  description?: string
  className?: string
  disabled?: boolean
  children?: React.ReactNode
}

export default (props: Props) => (
  <OverlayTrigger
    placement="top"
    delayShow={500}
    overlay={
      <Tooltip id={titleToId(props.title)}>
        <div>
          <strong>{props.title}</strong>
        </div>
        {props.shortcut && <div className={sharedStyle.shortcut}>{props.shortcut}</div>}
        {props.description}
      </Tooltip>
    }
  >
    <div
      className={classNames({ [sharedStyle.clickable]: !props.disabled }, style.item, props.className)}
      {..._.omit(props, ['title', 'description', 'children', 'className'])}
    >
      {props.children}
    </div>
  </OverlayTrigger>
)
