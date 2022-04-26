import classnames from 'classnames'
import _ from 'lodash'
import Mustache from 'mustache'
import React, { Component } from 'react'
import { OverlayTrigger, Popover, Well } from 'react-bootstrap'

import style from './style.scss'

export default class ConditionItem extends Component<any> {
  renderNormal(child: any) {
    return child
  }

  renderOverlay = (child: any) => {
    const popoverHoverFocus = (
      <Popover id="popover-action" title="⚡ Conditional transition">
        <Well>{this.props.condition.condition}</Well>
      </Popover>
    )

    return (
      <OverlayTrigger trigger={['hover', 'focus']} placement="top" delayShow={500} overlay={popoverHoverFocus}>
        {child}
      </OverlayTrigger>
    )
  }

  render() {
    let raw: string
    const { position } = this.props

    const { condition, caption } = this.props.condition

    const renderer = caption ? this.renderOverlay : this.renderNormal

    if (caption) {
      const vars = {}

      const stripDots = (str: string) => str.replace(/\./g, '--dot--')
      const restoreDots = (str: string) => str.replace(/--dot--/g, '.')

      const htmlTpl = caption.replace(/\[(.+)]/gi, (x) => {
        const name = stripDots(x.replace(/[\[\]]/g, ''))
        vars[name] = '<span class="val">' + _.escape(name) + '</span>'
        return '{{{' + name + '}}}'
      })

      raw = restoreDots(Mustache.render(htmlTpl, vars))
    } else {
      if ((condition && condition.length <= 0) || /^(yes|true)$/i.test(condition.toLowerCase())) {
        raw = position === 0 ? 'always' : 'otherwise'
      } else {
        raw = condition
      }
    }

    return renderer(
      <div className={classnames(this.props.className, style['action-item'], style['condition'])}>
        <span className={style.name} dangerouslySetInnerHTML={{ __html: raw }} />
        {this.props.children}
      </div>
    )
  }
}
