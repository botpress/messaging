import cx from 'classnames'
import React, { useCallback, forwardRef, FC } from 'react'
import { Grabber, OptionMenu, Text, TextIntents } from '../../../shared'
import BlockTags from './BlockTags'
import * as style from './style.module.scss'

// export enum BlockTypes {
//   CONTENT = 'content',
//   CODE = 'code'
// }

export interface OwnProps {
  block: any
  grab?: boolean
  temp?: boolean
  dragging?: boolean
  options?: boolean
  className?: string
  onDoubleClick?: () => void
  ref?: React.ForwardedRef<any>
}

const Block: FC<OwnProps> = forwardRef(
  ({ block, grab, temp, options, className, dragging, onDoubleClick = () => {} }, ref) => {
    const handleClicks = useCallback(
      (e) => {
        if (e.detail === 2) {
          onDoubleClick()
        }
      },
      [onDoubleClick]
    )

    return (
      <div ref={ref as any} className={cx(style.container, className)}>
        {grab && <Grabber className={cx({ [style.hidden]: dragging })} />}
        <div
          className={cx(style.block, { [style.temp]: temp, [style.grab]: grab, [style.dragging]: dragging })}
          onClick={handleClicks}
        >
          <BlockTags type={block.type} />
          {/* <Text className={style.type} value={block.type} large /> */}
          <Text className={style.name} intent={TextIntents.LITE} value={block.name} large />
          {/* <Text className={style.id} intent={TextIntent.LITE_PLACEHOLDER} value={} /> */}
          {grab && !dragging && <OptionMenu className={style.options} onAction={() => {}} />}
        </div>
      </div>
    )
  }
)

export default Block
