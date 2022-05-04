import React, { FC } from 'react'

import { BlockProps } from '../Block'
import NodeContentItem from '../Components/NodeContentItem'
import * as style from '../Components/style.module.scss'

type Props = Pick<BlockProps, 'node' | 'updateFlowNode' | 'switchFlowNode' | 'editNodeItem'>

const ExecuteContents: FC<Props> = ({ node, switchFlowNode, updateFlowNode, editNodeItem }) => {
  const handleItemChanged = (actionText) => {
    switchFlowNode(node.id)
    updateFlowNode({ onEnter: [actionText] })
  }

  const actionName = (node.onEnter && node.onEnter.length && node.onEnter[0]) || ''
  return (
    <div className={style.contentsWrapper}>
      <NodeContentItem onEdit={() => editNodeItem(node, 0)} className={style.contentWrapper}>
        <div className={style.content}>
          {/* <ActionModalSmall text={actionName} onChange={handleItemChanged} layoutv2 /> */}
        </div>
      </NodeContentItem>
    </div>
  )
}

export default ExecuteContents
