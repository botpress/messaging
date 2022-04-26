import { Button, Position } from '@blueprintjs/core'
import cx from 'classnames'
import React from 'react'
import { RiLayoutLeftLine, RiLayoutRightLine, RiLayoutBottomLine } from 'react-icons/ri'
import { connect } from 'react-redux'
import { toggleBottomPanel, toggleExplorer } from '~/actions'
import ToolTip from '~/components/Shared/ToolTip'
import { lang } from '~/components/Shared/translations'
import { shortControlKey } from '~/components/Shared/utilities/keyboardShortcuts'

import { RootReducer } from '../../../reducers'
import EnterPriseTrial from './EnterpriseTrial'
import RightToolBar from './RightToolbar'

import style from './style.scss'

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

// We cannot use setEmulatorOpen as it's actually the state is actually controlled by the message passed from the iframe
// Will need some refactor for the emulator
// This should be moved this somewhere else, it seems to be all around the app
const toggleEmulator = () => {
  window.botpressWebChat.sendEvent({ type: 'toggle' })
}

const TopNav = (props: Props) => {
  return (
    <nav className={style.topNav}>
      <EnterPriseTrial />
      <div className={style.layoutControls}>
        <ToolTip
          content={lang.tr('topNav.toggleExplorer', { shortcut: `${shortControlKey} B` })}
          position={Position.BOTTOM}
        >
          <Button
            minimal
            onClick={props.toggleExplorer}
            className={cx({ [style.active]: props.explorerOpen })}
            icon={<RiLayoutLeftLine size={17} />}
          />
        </ToolTip>

        <ToolTip
          content={lang.tr('topNav.toggleDebugger', { shortcut: `${shortControlKey} J` })}
          position={Position.BOTTOM}
        >
          <Button
            minimal
            onClick={props.toggleBottomPanel}
            className={cx({ [style.active]: props.isBottomPanelOpen })}
            icon={<RiLayoutBottomLine size={17} />}
          />
        </ToolTip>
        {window.IS_BOT_MOUNTED && (
          <ToolTip
            content={lang.tr('topNav.toggleEmulator', { shortcut: `${shortControlKey} E` })}
            position={Position.BOTTOM}
          >
            <Button
              minimal
              onClick={toggleEmulator}
              className={cx({ [style.active]: props.emulatorOpen })}
              icon={<RiLayoutRightLine size={17} />}
            />
          </ToolTip>
        )}
      </div>
      <RightToolBar />
    </nav>
  )
}

const mapStateToProps = (state: RootReducer) => ({
  docHints: state.ui.docHints,
  isBottomPanelOpen: state.ui.bottomPanel,
  emulatorOpen: state.ui.emulatorOpen,
  explorerOpen: state.ui.explorerOpen
})

const mapDispatchToProps = {
  toggleBottomPanel,
  toggleExplorer
}

export default connect(mapStateToProps, mapDispatchToProps)(TopNav)
