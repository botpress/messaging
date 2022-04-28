import cx from 'classnames'
import React, { FC } from 'react'

import ActionItem from '../../../../../components/Layout/StatusBar/ActionItem'
import store from '../../../../../store'
import { isRTLLocale } from '../../../../../translations'
import ConditionItem from '../../../../../views/FlowBuilder/common/condition'
import { StandardPortWidget } from '../../nodes/Ports'
import { BlockProps } from '../Block'
import * as style from '../Components/style.module.scss'
import * as localStyle from './style.module.scss'

type Props = Pick<BlockProps, 'node'>

const StandardContents: FC<Props> = ({ node }) => {
  const isWaiting = node.waitOnReceive
  const {
    language: { contentLang }
  } = store.getState()

  return (
    <div className={cx(style.contentsWrapper, style.standard)}>
      {node.onEnter?.map((item, i) => {
        return (
          <ActionItem
            key={`${i}.${item}`}
            className={cx(style.contentWrapper, style.content, localStyle.item)}
            text={item}
          />
        )
      })}

      {isWaiting && <div className={localStyle.waitInput}>wait for user input</div>}

      {node.onReceive?.map((item, i) => {
        return (
          <ActionItem
            key={`${i}.${item}`}
            className={cx(style.contentWrapper, style.content, localStyle.item)}
            text={item}
          />
        )
      })}

      {node.next?.map((item, i) => {
        const outputPortName = `out${i}`
        return (
          <div
            key={`${i}.${item}`}
            className={cx(style.contentWrapper, style.small, {
              [style.rtl]: isRTLLocale(contentLang)
            })}
          >
            <div className={cx(style.content, style.readOnly)}>
              <ConditionItem condition={item} position={i} />
              <StandardPortWidget name={outputPortName} node={node} className={style.outRouting} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
export default StandardContents
