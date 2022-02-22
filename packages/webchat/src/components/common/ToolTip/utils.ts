interface PositionClasses {
  xClass: string
  yClass: string
}

export const getPositions = (
  positionClasses: PositionClasses,
  el: EventTarget & Element,
  tooltip: HTMLDivElement | null
) => {
  const { xClass, yClass } = positionClasses
  const elementRect = el.getBoundingClientRect()
  const tooltipRect = tooltip?.getBoundingClientRect()
  const elLeft = elementRect.left
  const elWidth = elementRect.width
  const elTop = elementRect.top
  const elHeight = elementRect.height
  const tooltipWidth = tooltipRect?.width || 0
  const tooltipHeight = tooltipRect?.height || 0

  let left = elLeft + elWidth / 2 - tooltipWidth / 2

  if (xClass === 'left') {
    left = elLeft - tooltipWidth

    if (yClass === 'top' || yClass === 'bottom') {
      left = left + elWidth
    }
  } else if (xClass === 'right') {
    left = elLeft

    if (yClass !== 'top' && yClass !== 'bottom') {
      left = elLeft + elWidth
    }
  }

  let top = elTop + elHeight / 2 - tooltipHeight / 2

  if (yClass === 'top') {
    top = elTop - tooltipHeight
  } else if (yClass === 'bottom') {
    top = elTop + elHeight
  }

  return { left, top }
}

export const tipPosition = (positionClasses: PositionClasses, el: Element & EventTarget) => {
  const { xClass, yClass } = positionClasses
  const elementRect = el?.getBoundingClientRect()
  const elWidth = elementRect?.width || 0

  let left = 'auto'
  let right = 'auto'

  if (xClass === 'left' && (yClass === 'top' || yClass === 'bottom')) {
    right = `${elWidth / 2 - 5}px`
  } else if (xClass === 'right' && (yClass === 'top' || yClass === 'bottom')) {
    left = `${elWidth / 2 - 5}px`
  } else if (!xClass) {
    left = '50%'
  }

  return { left, right }
}

export const checkXPosition = (canBeXMiddle: boolean, canBeLeft: boolean) => {
  if (!canBeXMiddle) {
    if (canBeLeft) {
      return 'left'
    } else {
      return 'right'
    }
  }

  return ''
}

export const checkYPosition = (canBeYMiddle: boolean, canBeAbove: boolean) => {
  if (!canBeYMiddle) {
    if (canBeAbove) {
      return 'top'
    } else {
      return 'bottom'
    }
  }

  return ''
}
