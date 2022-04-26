import { Icon } from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import ShortcutLabel from '~/components/Shared/ShortcutLabel'
import ToolTip from '~/components/Shared/ToolTip'
import { lang } from '~/components/Shared/translations'
import { shortControlKey } from '~/components/Shared/utilities/keyboardShortcuts'
import { RootReducer } from '~/reducers'

import DeployCloudBtn from './DeployCloudBtn'
import style from './style.scss'

interface Props {
  docHints: any[]
  isEmulatorOpen: boolean
  isCloudBot: boolean
}

const RightToolBar = (props: Props) => {
  const { docHints, isCloudBot } = props
  const toggleEmulator = () => {
    window.botpressWebChat.sendEvent({ type: 'toggle' })
  }
  const toggleDocs = (e) => {
    e.preventDefault()

    if (docHints.length) {
      window.open(`https://botpress.com/docs/${docHints[0]}`, '_blank')
    }
  }

  return (
    <div>
      {docHints.length > 0 && (
        <>
          <ToolTip
            content={
              <div className={style.tooltip}>
                {lang.tr('topNav.help')}
                <div className={style.shortcutLabel}>
                  <ShortcutLabel light shortcut="docs-toggle" />
                </div>
              </div>
            }
          >
            <button className={style.item} onClick={toggleDocs}>
              <Icon color="#1a1e22" icon="help" iconSize={16} />
            </button>
          </ToolTip>
          <span className={style.divider}></span>
        </>
      )}
      {isCloudBot ? <DeployCloudBtn /> : null}
      {window.IS_BOT_MOUNTED && (
        <ToolTip content={lang.tr('topNav.toggleEmulator', { shortcut: `${shortControlKey} E` })}>
          <button
            className={classNames(style.item, style.itemSpacing, { [style.active]: props.isEmulatorOpen })}
            onClick={toggleEmulator}
            id="statusbar_emulator"
          >
            <Icon color="#1a1e22" icon="chat" iconSize={16} />
            <span className={style.label}>{lang.tr('topNav.emulator')}</span>
          </button>
        </ToolTip>
      )}
    </div>
  )
}

const mapStateToProps = (state: RootReducer) => ({
  docHints: state.ui.docHints,
  emulatorOpen: state.ui.emulatorOpen,
  isCloudBot: state.bot.isCloudBot
})

export default connect(mapStateToProps)(RightToolBar)
