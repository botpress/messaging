import { Button } from '@blueprintjs/core'
import cx from 'classnames'
import React, { FC, useState } from 'react'

import sharedStyle from '../../../Shared/style.scss'
import MoreOptions from '../../MoreOptions'
import { MoreOptionsItems } from '../../MoreOptions/typings'
import { lang } from '../../translations'

import style from './style.scss'
import { GroupItemWrapperProps } from './typings'

const GroupItemWrapper: FC<GroupItemWrapperProps> = ({
  label,
  borderTop,
  contextMenu,
  defaultCollapsed,
  onDelete,
  children
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed || false)
  const [showOptions, setShowOptions] = useState(false)

  const processMoreOptions = (): MoreOptionsItems[] => {
    if (!contextMenu) {
      return []
    }

    return contextMenu.map(({ label, type }) => ({
      type: type === 'delete' ? type : undefined,
      label: lang.tr(label),
      action: type === 'delete' ? onDelete : undefined
    }))
  }

  return (
    <div className={cx(sharedStyle.fieldWrapper, { [style.borderTop]: borderTop })}>
      <div className={style.labelWrapper}>
        {label && (
          <Button
            minimal
            onClick={() => setCollapsed(!collapsed)}
            className={style.groupLabel}
            text={label}
            icon={collapsed ? 'chevron-right' : 'chevron-down'}
          />
        )}
        {!!contextMenu?.length && (
          <MoreOptions show={showOptions} onToggle={setShowOptions} items={processMoreOptions()} />
        )}
      </div>
      {!collapsed && children}
    </div>
  )
}

export default GroupItemWrapper
