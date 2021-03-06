import { Icon, Tooltip } from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'

import ShortcutLabel from '../../../components/Shared/ShortcutLabel'
import { lang } from '../../../components/Shared/translations'
import { shortControlKey } from '../../../components/Shared/utilities/keyboardShortcuts'
import { RootReducer } from '../../../reducers'

import DeployCloudBtn from './DeployCloudBtn'
import * as style from './style.module.scss'

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
          <Tooltip
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
          </Tooltip>
          <span className={style.divider}></span>
        </>
      )}
      {isCloudBot ? <DeployCloudBtn /> : null}
      {window.IS_BOT_MOUNTED && (
        <Tooltip content={lang.tr('topNav.toggleEmulator', { shortcut: `${shortControlKey} E` })}>
          <button
            className={classNames(style.item, style.itemSpacing, { [style.active]: props.isEmulatorOpen })}
            onClick={toggleEmulator}
            id="statusbar_emulator"
          >
            <Icon color="#1a1e22" icon="chat" iconSize={16} />
            <span className={style.label}>{lang.tr('topNav.emulator')}</span>
          </button>
        </Tooltip>
      )}
    </div>
  )
}

const mapStateToProps = (state: RootReducer) => ({
  docHints: state.ui.docHints,
  emulatorOpen: state.ui.emulatorOpen,
  isCloudBot: state.bot.bot.isCloudBot
})

export default connect(mapStateToProps)(RightToolBar)
