import { Button } from '@blueprintjs/core'
import cx from 'classnames'
import React, { FC, SyntheticEvent, useState } from 'react'

import { connect } from 'react-redux'
import { RootReducer } from '~/reducers'
import { isRTLLocale } from '~/translations'
import { NodeDebugInfo } from '../../debugger'

import { DebugInfo } from './DebugInfo'
import style from './style.scss'

type StateProps = ReturnType<typeof mapStateToProps>

interface Props {
  setExpanded?: (expanded: boolean) => void
  expanded?: boolean
  defaultLabel: string
  handleContextMenu?: (e: SyntheticEvent) => void
  children?: any
  className?: string
  debugInfo: NodeDebugInfo
  nodeType: string
}

const NodeHeader: FC<StateProps & Props> = ({
  setExpanded,
  expanded,
  defaultLabel,
  handleContextMenu,
  debugInfo,
  children,
  nodeType,
  className,
  contentLang
}) => {
  const [startMouse, setStartMouse] = useState({ x: 0, y: 0 })
  const icon = expanded ? 'chevron-down' : 'chevron-right'

  return (
    <div
      className={cx(style.headerWrapper, className, {
        [style.rtl]: isRTLLocale(contentLang)
      })}
    >
      {debugInfo && <DebugInfo {...debugInfo} nodeType={nodeType} className={className}></DebugInfo>}
      <Button
        icon={setExpanded ? icon : null}
        onClick={(e) => {
          if (e.screenX - startMouse.x === 0 && e.screenY - startMouse.y === 0) {
            setExpanded && setExpanded(!expanded)
          }
        }}
        onMouseDown={(e) => setStartMouse({ x: e.screenX, y: e.screenY })}
        className={style.button}
        onContextMenu={(e) => handleContextMenu && handleContextMenu(e)}
      >
        {defaultLabel}
      </Button>
      {children}
    </div>
  )
}

const mapStateToProps = (state: RootReducer) => ({
  contentLang: state.language.contentLang
})

export default connect(mapStateToProps)(NodeHeader)
