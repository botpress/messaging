import _ from 'lodash'
import React, { FC } from 'react'
import { connect } from 'react-redux'
import { lang } from '~/components/Shared/translations'
import { RootReducer } from '~/reducers'

import LangSwitcher from './LangSwitcher'
import style from './style.scss'
import TrainingStatusComponent from './TrainingStatus'

interface Props {
  langSwitcherOpen: boolean
  user: any
  botInfo: any
  contentLang: string
  toggleLangSwitcher: (e: any) => void
}

const StatusBar: FC<Props> = (props) => {
  const isCloudBot = Boolean(props.botInfo?.cloud?.clientId)
  return (
    <footer className={style.statusBar}>
      <div className={style.item}>
        <span>{(window as any).STUDIO_VERSION}</span>
        <span className={style.botName}>{window.BOT_ID}</span>
        {isCloudBot && <span>{lang.tr('statusBar.cloudEnabled')}</span>}
        <LangSwitcher toggleLangSwitcher={props.toggleLangSwitcher} langSwitcherOpen={props.langSwitcherOpen} />
      </div>
      <div className={style.item}>
        <TrainingStatusComponent currentLanguage={props.contentLang} />
      </div>
    </footer>
  )
}

const mapStateToProps = (state: RootReducer) => ({
  user: state.user,
  botInfo: state.bot.bot,
  contentLang: state.language.contentLang
})

export default connect(mapStateToProps)(StatusBar)
