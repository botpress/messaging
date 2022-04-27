import classNames from 'classnames'
import _ from 'lodash'
import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import sharedStyle from '../TopNav/style.scss'
import style from './style.scss'

const titleToId = (txt) => txt.replace(/[^\W]/gi, '_')

export default (props) => (
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
