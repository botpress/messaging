import React, { FC } from 'react'

import { CustomIconProps } from '../types'

const Carousel: FC<CustomIconProps> = ({ size = 16, color }) => (
  <span className="bp3-icon">
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2.45241L12 13.5476C12 13.7038 11.9429 13.827 11.8736 13.9036C11.8057 13.9786 11.7381 14 11.6856 14L4.31436 14C4.2619 14 4.19431 13.9786 4.12643 13.9036C4.05709 13.827 4 13.7038 4 13.5476L4 2.45241C4 2.29615 4.05709 2.17302 4.12643 2.09639C4.19431 2.02139 4.2619 2 4.31436 2L11.6856 2C11.7381 2 11.8057 2.02139 11.8736 2.09639C11.9429 2.17302 12 2.29615 12 2.45241Z"
        strokeWidth="2"
        strokeMiterlimit="10"
      />
      <rect y="3" width="2" height="10" rx="1" />
      <rect x="14" y="3" width="2" height="10" rx="1" />
    </svg>
  </span>
)

export default Carousel
