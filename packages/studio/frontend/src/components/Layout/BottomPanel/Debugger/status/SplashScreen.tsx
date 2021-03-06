import React from 'react'

import { lang } from '../../../../../components/Shared/translations'
import DebuggerIcon from '../components/DebuggerIcon'
import * as style from '../style.module.scss'

export default () => (
  <div className={style.splash}>
    <div>
      <span className={style.debuggerIcon}>
        <DebuggerIcon />
      </span>
      <p>{lang.tr('bottomPanel.debugger.splashMessage')}</p>
    </div>
  </div>
)
