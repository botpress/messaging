import React from 'react'
import ToolTip from '~/components/Shared/ToolTip'
import { lang } from '~/components/Shared/translations'
import style from './style.scss'

export default () => {
  return (window as any).IS_PRO_ENABLED ? (
    <div />
  ) : (
    <ToolTip position="right-bottom" content="topNav.salesCallToActionDescription">
      <a className={style.cta_btn} target="_blank" href="https://botpress.com/request-trial-from-app">
        {lang.tr('topNav.salesCallToAction')}
      </a>
    </ToolTip>
  )
}
