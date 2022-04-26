import _ from 'lodash'
import React from 'react'
import ContentSection from '~/components/Shared/ContentSection'
import { lang } from '~/components/Shared/translations'

import style from '../style.scss'

import { Intent } from './Intent'

interface IntentDef {
  name: string
  confidence: number
}

interface Props {
  intent: IntentDef
  intents: IntentDef[]
}

export const Intents = (props: Props) => {
  const { intent, intents } = props
  if (!intent || !intents || !intents.length) {
    return null
  }

  return (
    <ContentSection title={lang.tr('bottomPanel.debugger.topIntents')} className={style.section}>
      {intents.length > 1 && (
        <ul>
          {_.take(intents, 4).map((i) => (
            <li key={i.name}>
              <Intent name={i.name} confidence={i.confidence} elected={i.name === intent.name} />
            </li>
          ))}
        </ul>
      )}
      {intents.length === 1 && <Intent name={intent.name} confidence={intent.confidence} elected />}
    </ContentSection>
  )
}
