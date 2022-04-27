import { Button, Icon, IconName } from '@blueprintjs/core'
import cx from 'classnames'
import React, { FC, Fragment } from 'react'
import style from './style.scss'

import { MoreOptionsMenuProps } from './typings'

const MoreOptionsMenu: FC<MoreOptionsMenuProps> = (props) => {
  const { className, items } = props

  const onAction = (e, action) => {
    e.stopPropagation()
    action()
  }

  return (
    <ul className={cx(style.moreMenu, 'more-options-more-menu', className)}>
      {items.map((item, index) => {
        const { action, className, content, icon, label, type, selected } = item

        return (
          <li key={index} className={className}>
            {content ? (
              content
            ) : (
              <Fragment>
                {action && (
                  <Button
                    icon={icon as IconName}
                    minimal
                    className={cx(style.moreMenuItem, {
                      [style.delete]: type === 'delete',
                      ['more-options-selected-option']: selected
                    })}
                    onClick={(e) => onAction(e, action)}
                  >
                    {label}
                    {selected && <Icon icon="tick" iconSize={12} />}
                  </Button>
                )}
                {!action && (
                  <span className={cx(style.moreMenuItem, style.noHover, { [style.delete]: type === 'delete' })}>
                    <Icon icon={icon as IconName} iconSize={16} />
                    {label}
                  </span>
                )}
              </Fragment>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default MoreOptionsMenu
