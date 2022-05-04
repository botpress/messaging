// import useResizeObserver from '@react-hook/resize-observer'
// import cx from 'classnames'
// import update from 'immutability-helper'
// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useRef,
//   memo,
//   useLayoutEffect,
//   RefObject,
//   MutableRefObject,
//   FC
// } from 'react'
// import { useDrag, useDrop } from 'react-dnd'
// import { getEmptyImage } from 'react-dnd-html5-backend'
// import { Label, AddBtn, Text, TextIntents, FormKitOnAction } from '../../shared'
// import * as layout from '../../shared/layout.module.scss'
// import Block from '../Block'
// import CustomDragLayer from './CustomDragLayer'
// import * as style from './style.scss'
// import { BlockData } from './types'

// export enum BlockListActions {
//   UPDATE = 'update',
//   CREATE = 'create',
//   DISABLE = 'disable'
// }

// enum BlockTypes {
//   BLOCK = 'block'
// }

// export interface DragBlockProps {
//   block: any
//   formId: string
//   onDoubleClick?: () => void
//   moveBlock: (id: string, to: number) => void
//   findBlock: (id: string) => { block: any; index: number }
// }

// export interface OwnProps {
//   id: string
//   value: any[]
//   label: string
//   hint?: string
//   disableable?: boolean
//   disableText?: string
//   onAction?: FormKitOnAction<BlockListActions>
// }

// const DragBlock: FC<DragBlockProps> = memo(({ formId, block, onDoubleClick, moveBlock, findBlock }) => {
//   const originalIndex = findBlock(block.id).index
//   const [{ isDragging }, drag, preview] = useDrag(
//     () => ({
//       type: formId,
//       item: { id: block.id, block, originalIndex },
//       collect: (monitor) => ({
//         isDragging: monitor.isDragging()
//       }),
//       end: (item, monitor) => {
//         // const { id: droppedId, originalIndex } = item
//         // const didDrop = monitor.didDrop()
//         // if (!didDrop) {
//         //   moveBlock(droppedId, originalIndex)
//         // }
//       }
//     }),
//     [block, originalIndex, moveBlock]
//   )

//   const [, drop] = useDrop(
//     () =>
//       ({
//         accept: formId,
//         hover: ({ id: draggedId }: any) => {
//           if (draggedId !== block.id) {
//             const overIndex = findBlock(block.id).index
//             moveBlock(draggedId, overIndex)
//           }
//         }
//       } as any),
//     [findBlock, moveBlock]
//   )

//   useEffect(() => {
//     preview(getEmptyImage(), { captureDraggingState: true })
//   }, [])

//   return (
//     <Block ref={(node) => drag(drop(node))} block={block} onDoubleClick={onDoubleClick} dragging={isDragging} grab />
//   )
// })

// interface ListProps {
//   type: string
// }

// const List: FC<ListProps> = ({ children, type }) => {
//   const ref = useRef(null)
//   const [dragLayerProps, setDragLayerProps] = useState({
//     layerOffset: 0,
//     maxHeight: 0
//   })

//   useEffect(() => {
//     console.log('PROPS')
//     const { current } = ref
//     if (current) {
//       const { top, height } = (current as HTMLDivElement).getBoundingClientRect()
//       console.log(type, top, height)
//       setDragLayerProps({
//         layerOffset: top || 0,
//         maxHeight: height || 0
//       })
//     }
//   }, [children, setDragLayerProps, type])

//   return (
//     <div className={style.container} ref={ref}>
//       {children}
//       <CustomDragLayer type={type} {...dragLayerProps} />
//     </div>
//   )
// }

// const BlockList: FC<OwnProps> = ({ id, label, hint, value, disableable, disableText, onAction = () => {} }) => {
//   const [dragLayerProps, setDragLayerProps] = useState({
//     layerOffset: 0,
//     maxHeight: 0
//   })
//   const [blocks, setBlocks] = useState([] as BlockData[])

//   useEffect(() => {
//     if (value) {
//       setBlocks(value)
//     }
//   }, [value, setBlocks])

//   const findBlock = useCallback(
//     (id: string) => {
//       const blockIdx = blocks.findIndex((b) => b.id === id)
//       return {
//         block: blocks[blockIdx],
//         index: blockIdx
//       }
//     },
//     [blocks]
//   )

//   const moveBlock = useCallback(
//     (id: string, atIndex: number) => {
//       const { block, index } = findBlock(id)
//       setBlocks(
//         update(blocks, {
//           $splice: [
//             [index, 1],
//             [atIndex, 0, block]
//           ]
//         })
//       )
//     },
//     [findBlock, blocks, setBlocks]
//   )

//   // const [, drop] = useDrop(() => ({ accept: BlockTypes.BLOCK }))

//   return (
//     <div className={layout.formKitContainer}>
//       <div className={layout.labelSection}>
//         <Label className={layout.center} label={label} hint={hint} />
//         <AddBtn className={layout.rightBtn} />
//       </div>
//       <List type={id}>
//         {blocks.length ? (
//           blocks.map((b) => (
//             <DragBlock
//               key={b.id}
//               formId={id}
//               block={b}
//               findBlock={findBlock}
//               moveBlock={moveBlock}
//               onDoubleClick={() => {}}
//             />
//           ))
//         ) : (
//           <Text value="Add a block to get started" intent={TextIntents.LITE_PLACEHOLDER} />
//         )}
//       </List>
//     </div>
//   )
// }

// export default BlockList
