import React, { FC } from 'react'

import { CustomIconProps } from '../types'

const Card: FC<CustomIconProps> = ({ size = 16, color }) => (
  <span className="bp3-icon">
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.5 12.7971H2.5C2.2 12.7971 2 12.9971 2 13.2971C2 13.5971 2.2 13.7971 2.5 13.7971H9.5C9.8 13.7971 10 13.5971 10 13.2971C10 12.9971 9.8 12.7971 9.5 12.7971ZM1 15.7971H15C15.6 15.7971 16 15.3971 16 14.7971V2.79706C16 2.19706 15.6 1.79706 15 1.79706H1C0.4 1.79706 0 2.19706 0 2.79706V14.7971C0 15.3971 0.4 15.7971 1 15.7971ZM2 3.79706H14V11.7971H2V3.79706Z"
      />
    </svg>
  </span>
)

export default Card
