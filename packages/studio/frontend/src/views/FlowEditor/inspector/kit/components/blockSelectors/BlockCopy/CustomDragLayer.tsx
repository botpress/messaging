// import React, { useRef, useEffect, useCallback, useMemo, FC } from 'react'
// import { useDragLayer } from 'react-dnd'
// import Block from '../Block'
// import * as style from './style.scss'

// interface OwnProps {
//   type: string
//   layerOffset?: number
//   maxHeight?: number
// }

// function getItemStyles(initialOffset: any, currentOffset: any) {
//   if (!initialOffset || !currentOffset) {
//     return {
//       display: 'none'
//     }
//   }
//   console.log(initialOffset)
//   const x = 0
//   const y = initialOffset - 265 > 0 ? initialOffset - 265 : 0

//   console.log(y)

//   const transform = `translate(${x}px, ${y}px)`
//   return {
//     transform,
//     WebkitTransform: transform
//   }
// }
// const CustomDragLayer: FC<OwnProps> = ({ type, layerOffset, maxHeight }) => {
//   const { isDragging, item, itemType, currentSourceYOffset } = useDragLayer((monitor) => ({
//     item: monitor.getItem(),
//     itemType: monitor.getItemType(),
//     currentSourceYOffset: monitor.getSourceClientOffset()?.y,
//     isDragging: monitor.isDragging()
//   }))

//   const calcTransformStyle = useMemo(() => {
//     const EXTRA_OFFSET = -10
//     const BLOCK_SIZE = 55
//     if (!currentSourceYOffset || !layerOffset || !maxHeight) {
//       return {
//         display: 'none'
//       }
//     }

//     const x = 0
//     console.log(currentSourceYOffset, layerOffset, maxHeight)
//     const y = Math.min(Math.max(currentSourceYOffset - layerOffset + EXTRA_OFFSET, 0), maxHeight - BLOCK_SIZE)
//     const transform = `translate(${x}px, ${y}px)`

//     return {
//       transform,
//       WebkitTransform: transform
//     }
//   }, [currentSourceYOffset, layerOffset, maxHeight])

//   return (
//     (isDragging && type === itemType && (
//       <div className={style.customDragLayer}>
//         <div style={calcTransformStyle}>{<Block block={item.block} grab />}</div>
//       </div>
//     )) ||
//     null
//   )
// }

// export default CustomDragLayer
