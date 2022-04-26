import { Button } from '@blueprintjs/core'
import React from 'react'
import { connect } from 'react-redux'
import ToolTip from '~/components/Shared/ToolTip'
import { lang } from '~/components/Shared/translations'

import { RootReducer } from '../../../../reducers'
import { ZOOM_MAX, ZOOM_MIN } from '../constants'

import style from './style.scss'

type StateProps = ReturnType<typeof mapStateToProps>

type Props = StateProps & {
  zoomIn: () => void
  zoomOut: () => void
  zoomToLevel: (level: number) => void
  zoomToFit: () => void
}

const ZoomToolbar = ({ zoomLevel, zoomIn, zoomOut, zoomToLevel, zoomToFit }: Props) => (
  <div className={style.zoomWrapper}>
    <ToolTip content={lang.tr('studio.flow.zoomOut')}>
      <Button icon="zoom-out" disabled={zoomLevel <= ZOOM_MIN} onClick={zoomOut} />
    </ToolTip>
    <label>
      <span className={style.label}>{zoomLevel}%</span>
      <select value={zoomLevel} onChange={({ currentTarget: { value } }) => zoomToLevel(Number.parseInt(value))}>
        <option value={25}>25%</option>
        <option value={50}>50%</option>
        <option value={75}>75%</option>
        <option value={100}>100%</option>
        <option value={150}>150%</option>
        <option value={200}>200%</option>
      </select>
    </label>
    <ToolTip content={lang.tr('studio.flow.zoomIn')}>
      <Button icon="zoom-in" onClick={zoomIn} disabled={zoomLevel >= ZOOM_MAX} />
    </ToolTip>
    <ToolTip content={lang.tr('studio.flow.zoomToFit')}>
      <Button className={style.zoomToFit} icon="zoom-to-fit" onClick={zoomToFit} />
    </ToolTip>
  </div>
)

const mapStateToProps = (state: RootReducer) => ({
  zoomLevel: state.ui.zoomLevel
})

export default connect<StateProps>(mapStateToProps)(ZoomToolbar)
