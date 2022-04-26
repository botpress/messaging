import classnames from 'classnames'
import React from 'react'
import { lang } from '~/components/Shared/translations'

import DebuggerIcon from '../components/DebuggerIcon'
import style from '../style.scss'

export default () => (
  <div className={classnames(style.splash, style.notFound)}>
    <div>
      <DebuggerIcon />
      <h2>{lang.tr('bottomPanel.debugger.unauthorized')}</h2>
      <p>
        {lang.tr('bottomPanel.debugger.unauthorizedMessage')} <br />
        {lang.tr('bottomPanel.debugger.unauthorizedMessage2')}
      </p>
    </div>
  </div>
)
