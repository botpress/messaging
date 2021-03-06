import { Icon, Position, Tooltip } from '@blueprintjs/core'
import cx from 'classnames'
import React, { FC } from 'react'
import { NavLink } from 'react-router-dom'

import logo from '../../../../img/logo-icon.svg'
import * as style from './style.module.scss'
import { MenuItem, MenuProps } from './typings'

const Menu: FC<MenuProps> = ({ items, className }) => {
  const renderBasicItem = ({ name, path, icon }: MenuItem) => (
    <li id={`bp-menu_${name}`} key={path}>
      <Tooltip boundary="window" position={Position.RIGHT} content={name}>
        {/* @ts-ignore */}
        <NavLink to={path} title={name} activeClassName={style.active}>
          <Icon icon={icon} iconSize={16} />
        </NavLink>
      </Tooltip>
    </li>
  )

  return (
    <aside className={cx(style.sidebar, className, 'bp-sidebar')}>
      <a href="admin/" className={cx(style.logo, 'bp-logo')}>
        <img width="19" src={logo} alt="Botpress Logo" />
      </a>
      {!!items?.length && <ul className={cx('nav')}>{items.map(renderBasicItem)}</ul>}
    </aside>
  )
}

export default Menu
