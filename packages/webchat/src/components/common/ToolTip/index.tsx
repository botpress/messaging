import cx from 'classnames'
import _uniqueId from 'lodash/uniqueId'
import React, { FC, useRef } from 'react'
import ReactDOM from 'react-dom'

import * as style from './style.module.scss'
import { getPositions, tipPosition, checkXPosition, checkYPosition } from './utils'

interface ToolTipProps {
  hoverOpenDelay?: number
  children: JSX.Element
  content?: string | JSX.Element
  position?: string
  childId?: string
}

const ToolTip: FC<ToolTipProps> = ({ childId, children, content, position = 'top', hoverOpenDelay }: ToolTipProps) => {
  if (!content) {
    return children
  }

  const id = useRef(`botpress-tooltip-${_uniqueId()}`)
  const timeout = useRef<number | undefined>(undefined)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)

  const pastShow = (el: EventTarget & Element) => {
    const elementRect = el.getBoundingClientRect()
    const tooltipRect = tooltipRef.current?.getBoundingClientRect()

    if (!tooltipRect) {
      return
    }

    const docWidth = document.documentElement.clientWidth,
      docHeight = document.documentElement.clientHeight

    const rx = elementRect.x + elementRect.width // most right x
    const lx = elementRect.x // most left x
    const ty = elementRect.y // most top y
    const by = elementRect.y + elementRect.height // most bottom y
    const overflowYMiddle = (tooltipRect.height - elementRect.height) / 2

    let overflowXMiddle = (tooltipRect.width - elementRect.width) / 2
    overflowXMiddle = overflowXMiddle < 0 ? 0 : overflowXMiddle

    const canBeXMiddle = rx + overflowXMiddle <= docWidth && lx - overflowXMiddle >= 0
    const canBeRight = rx + tooltipRect.width <= docWidth
    const canBeLeft = lx - tooltipRect.width >= 0
    const canBeYMiddle = ty - overflowYMiddle >= 0 && by + overflowYMiddle <= docHeight
    const canBeAbove = ty - tooltipRect.height >= 0
    const canBeBellow = by + tooltipRect.height <= docHeight

    let xClass = ''
    let yClass = ''

    switch (position) {
      case 'top':
        yClass = 'top'

        if (!canBeAbove) {
          yClass = 'bottom'
        }
        xClass = checkXPosition(canBeXMiddle, canBeLeft)
        break
      case 'bottom':
        yClass = 'bottom'

        if (!canBeBellow) {
          yClass = 'top'
        }
        xClass = checkXPosition(canBeXMiddle, canBeLeft)
        break
      case 'left':
        xClass = 'left'

        if (!canBeLeft) {
          xClass = 'right'
        }
        yClass = checkYPosition(canBeYMiddle, canBeAbove)
        break
      case 'right':
        xClass = 'right'

        if (!canBeRight) {
          xClass = 'left'
        }
        yClass = checkYPosition(canBeYMiddle, canBeAbove)
        break
    }

    const { left, top } = getPositions({ xClass, yClass }, el, tooltipRef.current)
    const tipPos = tipPosition({ xClass, yClass }, el)

    const inlineStyle = {
      left: `${left}px`,
      top: `${top}px`
    }

    setTimeout(() => {
      tooltipRef.current?.classList.add(style.visible)
      if (xClass) {
        tooltipRef.current?.classList.add(xClass)
      }
      if (yClass) {
        tooltipRef.current?.classList.add(yClass)
      }

      if (tooltipRef.current) {
        tooltipRef.current.style.left = inlineStyle.left
        tooltipRef.current.style.top = inlineStyle.top
      }
      if (tipRef.current) {
        tipRef.current.style.left = tipPos.left
        tipRef.current.style.right = tipPos.right
      }
    }, hoverOpenDelay || 0)
  }

  const show = (event: React.MouseEvent) => {
    document.addEventListener('mousemove', mouseMove)

    clearTimeout(timeout.current)
    handleHtmlRendering()
    pastShow(event.currentTarget)
  }

  const mouseMove = (event: MouseEvent) => {
    if (!(event.target as Element | null)?.closest(`#${childId || `${id.current}-trigger`}`)) {
      hide()
    }
  }

  const handleHtmlRendering = (classNames = '', inlineStyle = {}, tipPos = {}) => {
    const body = document.getElementsByTagName('body')[0]
    const toolTip = document.getElementById(id.current) as HTMLElement
    const div = document.createElement('div')

    div.setAttribute('id', id.current)

    if (toolTip) {
      body.replaceChild(div, toolTip)
    } else {
      body.appendChild(div)
    }

    ReactDOM.render(
      <div ref={tooltipRef} className={cx(style.tooltip, classNames)} style={inlineStyle}>
        <div ref={tipRef} className="tooltipArrow" style={tipPos}></div>
        <div className="tooltipInner">{content}</div>
      </div>,
      div
    )
  }

  const hide = (_event?: React.MouseEvent<HTMLElement>) => {
    document.removeEventListener('mousemove', mouseMove)

    tooltipRef.current?.classList.remove(style.visible)
    const body = document.getElementsByTagName('body')[0]

    clearTimeout(timeout.current)
    timeout.current = window.setTimeout(() => {
      const div = document.getElementById(id.current)
      if (div) {
        body.removeChild(div)
      }
    }, 300)
  }

  return React.cloneElement<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>>(
    React.Children.only(children),
    {
      id: childId || `${id.current}-trigger`,
      onMouseEnter: show,
      onMouseLeave: hide
    }
  )
}

export default ToolTip
