import cx from 'classnames'
import React, { FC } from 'react'
import * as style from './style.module.scss'

export interface OwnProps {
  active?: boolean
  onClick?: () => void
  className?: string
}

const DynamicBtn: FC<OwnProps> = ({ active, className, onClick = () => {} }) => {
  return (
    <div className={cx(style.dynamicBtn, className)} aria-active={active} onClick={onClick}>
      <svg width="32" height="20" viewBox="0 0 26 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5.50926 1.65278H6.85417V0H5.39583C3.27315 0 2.1713 0.923611 2.1713 2.72222C2.1713 3.14352 2.21991 3.4838 2.26852 3.82407C2.31713 4.16435 2.38194 4.52083 2.38194 4.95833C2.38194 5.86574 2.00926 6.18981 0.972222 6.18981H0V7.81018H0.972222C2.00926 7.81018 2.38194 8.13426 2.38194 9.04167C2.38194 9.47917 2.33333 9.83565 2.26852 10.1759C2.2037 10.5162 2.1713 10.8565 2.1713 11.2778C2.1713 13.0764 3.27315 14 5.39583 14H6.85417V12.3472H5.50926C4.52083 12.3472 4.08333 11.9907 4.08333 11.213C4.08333 10.7917 4.11574 10.419 4.16435 10.0463C4.21296 9.67361 4.22917 9.30093 4.22917 8.91204C4.22917 7.82639 3.69444 7.14583 2.6412 7.0162V6.9838C3.69444 6.85417 4.22917 6.17361 4.22917 5.08796C4.22917 4.69907 4.19676 4.32639 4.16435 3.9537C4.13194 3.58102 4.08333 3.20833 4.08333 2.78704C4.08333 2.00926 4.52083 1.65278 5.50926 1.65278Z"
          fill="currentColor"
        />
        <path
          d="M16.5532 11.5856L13.7338 7.51852L16.3912 3.64583H14.2361L12.6967 6.01157L11.044 3.64583H8.72683L11.3842 7.46991L8.5648 11.5856H10.7199L12.4213 8.97685L14.2361 11.5856H16.5532Z"
          fill="currentColor"
        />
        <path
          d="M24.1296 6.18981C23.0926 6.18981 22.7199 5.86574 22.7199 4.95833C22.7199 4.52083 22.7685 4.16435 22.8333 3.82407C22.8981 3.4838 22.9305 3.14352 22.9305 2.72222C22.9305 0.923611 21.8287 0 19.706 0H18.2476V1.65278H19.5926C20.581 1.65278 21.0185 2.00926 21.0185 2.78704C21.0185 3.20833 20.9861 3.58102 20.9375 3.9537C20.8889 4.32639 20.8726 4.69907 20.8726 5.08796C20.8726 6.17361 21.4074 6.85417 22.4606 6.9838V7.0162C21.4074 7.14583 20.8726 7.82639 20.8726 8.91204C20.8726 9.30093 20.9051 9.67361 20.9375 10.0463C20.9699 10.419 21.0185 10.7917 21.0185 11.213C21.0185 11.9907 20.581 12.3472 19.5926 12.3472H18.2476V14H19.706C21.8287 14 22.9305 13.0764 22.9305 11.2778C22.9305 10.8565 22.8819 10.5162 22.8333 10.1759C22.7847 9.83565 22.7199 9.47917 22.7199 9.04167C22.7199 8.13426 23.0926 7.81018 24.1296 7.81018H25.1018V6.18981H24.1296Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}

export default DynamicBtn
