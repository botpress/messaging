import cx from 'classnames'
import React, { useState, useEffect, useCallback, forwardRef, FC } from 'react'
import { connect } from 'react-redux'

import Tags from '~/src/components/Tags'
import useInspectorStore from '../../../../store'
import { Text, TextIntents } from '../../../shared'
import * as style from './style.module.scss'

// export enum BlockTypes {
//   CONTENT = 'content',
//   CODE = 'code'
// }
export const BLOCK_HEIGHT_PX = 36 + 8 // height + padding

export interface OwnProps {
  block: any
  grab?: boolean
  temp?: boolean
  dragging?: boolean
  options?: boolean
  className?: string
  onDoubleClick?: () => void
  ref?: React.ForwardedRef<any>
  refreshFlowsLinks: any
  fetchContentItem: any
  items: any
}

const Block: FC<OwnProps> = forwardRef(
  ({ items, block, grab, temp, options, className, dragging, onDoubleClick = () => {} }, ref) => {
    const [actionId, setActionId] = useState('')
    const openTabId = useInspectorStore((state) => state.openTabId)

    const handleClicks = useCallback(
      (e) => {
        if (e.detail === 2) {
          openTabId(block)
        }
      },
      [onDoubleClick]
    )

    useEffect(() => {
      const id = block?.match(/^say #!(.*)$/)?.[1]
      if (id) {
        setActionId(id)
      } else {
        setActionId('')
      }
    }, [block, setActionId])

    return (
      <div ref={ref as any} className={cx(style.container, className)} onClick={handleClicks}>
        {/* {grab && <Grabber className={cx({ [style.hidden]: dragging })} />} */}
        <div className={cx(style.block, { [style.temp]: temp, [style.grab]: grab, [style.dragging]: dragging })}>
          <Tags type={!block.startsWith('say') ? 'code' : items[actionId]?.contentType} />
          {/* <Text className={style.type} value={block.type} large /> */}
          <Text
            className={style.name}
            intent={TextIntents.LITE}
            value={!block.startsWith('say') ? block.split(' ')[0] + ' (args)' : items[actionId]?.previews?.en}
            large
          />
          {/* <Text className={style.id} intent={TextIntent.LITE_PLACEHOLDER} value={} /> */}
        </div>
      </div>
    )
  }
)

const mapStateToProps = (state) => ({ items: state.content.itemsById })
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(Block)
