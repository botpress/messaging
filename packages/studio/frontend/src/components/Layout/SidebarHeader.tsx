import classnames from 'classnames'
import React, { Component } from 'react'
import { Navbar } from 'react-bootstrap'

import * as style from './SidebarHeader.module.scss'

export default class SidebarHeader extends Component {
  render() {
    const headerClass = classnames(style.header, 'bp-sidebar-header')

    return (
      <Navbar inverse className={headerClass}>
        <Navbar.Header>
          <Navbar.Toggle />
        </Navbar.Header>
      </Navbar>
    )
  }
}
