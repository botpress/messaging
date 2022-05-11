import React, { useState } from 'react'
import style from './style.module.scss'

interface OwnProps {
  onClick?: () => void
  error: boolean
}

const red = '#E76A6E'
const blue = '#0070F7'

const SwapIcon = ({ onClick, error }: OwnProps) => {
  const [isHover, setIsHover] = useState(false)
  const color = error ? red : blue

  return (
    <svg
      width="18"
      height="19"
      onClick={onClick}
      className={style.swap}
      viewBox="0 0 18 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <g clipPath="url(#clip0_227_4507)">
        <path
          d="M13.9998 1.38892H4.1123C2.17931 1.38892 0.612305 2.95592 0.612305 4.88892V14.7058C0.612305 16.6388 2.17931 18.2058 4.1123 18.2058H13.9998C15.9328 18.2058 17.4998 16.6388 17.4998 14.7058V4.88892C17.4998 2.95592 15.9328 1.38892 13.9998 1.38892Z"
          fill={isHover ? color : 'white'}
          stroke={isHover ? 'white' : color}
        />
        <g clipPath="url(#clip1_227_4507)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.2427 9.24249C13.8302 9.24249 13.4927 9.57999 13.4927 9.99249C13.4927 12.475 11.4752 14.4925 8.99268 14.4925C7.66518 14.4925 6.47268 13.9075 5.64768 12.9925H6.74268C7.15518 12.9925 7.49268 12.655 7.49268 12.2425C7.49268 11.83 7.15518 11.4925 6.74268 11.4925H3.74268C3.33018 11.4925 2.99268 11.83 2.99268 12.2425V15.2425C2.99268 15.655 3.33018 15.9925 3.74268 15.9925C4.15518 15.9925 4.49268 15.655 4.49268 15.2425V13.9375C5.58768 15.19 7.19268 15.9925 8.99268 15.9925C12.3077 15.9925 14.9927 13.3075 14.9927 9.99249C14.9927 9.57999 14.6552 9.24249 14.2427 9.24249ZM14.2427 3.99249C13.8302 3.99249 13.4927 4.32999 13.4927 4.74249V6.04749C12.3977 4.79499 10.7927 3.99249 8.99268 3.99249C5.67768 3.99249 2.99268 6.67749 2.99268 9.99249C2.99268 10.405 3.33018 10.7425 3.74268 10.7425C4.15518 10.7425 4.49268 10.405 4.49268 9.99249C4.49268 7.50999 6.51018 5.49249 8.99268 5.49249C10.3202 5.49249 11.5127 6.07749 12.3377 6.99249H11.2427C10.8302 6.99249 10.4927 7.32999 10.4927 7.74249C10.4927 8.15499 10.8302 8.49249 11.2427 8.49249H14.2427C14.6552 8.49249 14.9927 8.15499 14.9927 7.74249V4.74249C14.9927 4.32999 14.6552 3.99249 14.2427 3.99249Z"
            fill={isHover ? 'white' : color}
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_227_4507">
          <rect width="18" height="18" fill={isHover ? color : 'white'} transform="translate(0 0.797119)" />
        </clipPath>
        <clipPath id="clip1_227_4507">
          <rect width="12" height="12" fill="white" transform="translate(3 4)" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default SwapIcon
