import { Spinner } from '@blueprintjs/core'
import classnames from 'classnames'
import React from 'react'

import { lang } from '../../../../../components/Shared/translations'

import * as style from '../style.module.scss'

export default () => (
  <div className={classnames(style.splash)}>
    <div>
      <Spinner />
      <h2>{lang.tr('bottomPanel.debugger.fetchingEvent')}</h2>
    </div>
  </div>
)
