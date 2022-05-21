import { Icon } from '@blueprintjs/core'
import React, { FC } from 'react'
import * as style from './style.module.scss'

export interface OwnProps {
  type: string
  label?: boolean
}

const Card = () => (
  <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M9.5 12.7971H2.5C2.2 12.7971 2 12.9971 2 13.2971C2 13.5971 2.2 13.7971 2.5 13.7971H9.5C9.8 13.7971 10 13.5971 10 13.2971C10 12.9971 9.8 12.7971 9.5 12.7971ZM1 15.7971H15C15.6 15.7971 16 15.3971 16 14.7971V2.79706C16 2.19706 15.6 1.79706 15 1.79706H1C0.4 1.79706 0 2.19706 0 2.79706V14.7971C0 15.3971 0.4 15.7971 1 15.7971ZM2 3.79706H14V11.7971H2V3.79706Z"
      fill="white"
    />
  </svg>
)

const Carousel = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2.45241L12 13.5476C12 13.7038 11.9429 13.827 11.8736 13.9036C11.8057 13.9786 11.7381 14 11.6856 14L4.31436 14C4.2619 14 4.19431 13.9786 4.12643 13.9036C4.05709 13.827 4 13.7038 4 13.5476L4 2.45241C4 2.29615 4.05709 2.17302 4.12643 2.09639C4.19431 2.02139 4.2619 2 4.31436 2L11.6856 2C11.7381 2 11.8057 2.02139 11.8736 2.09639C11.9429 2.17302 12 2.29615 12 2.45241Z"
      stroke="white"
      stroke-width="2"
      stroke-miterlimit="10"
    />
    <rect y="3" width="2" height="10" rx="1" fill="white" />
    <rect x="14" y="3" width="2" height="10" rx="1" fill="white" />
  </svg>
)

export const TagGroups = {
  simple: [
    { type: 'builtin_text', icon: <Icon icon="chat" color="#fff" size={12} /> },
    { type: 'builtin_audio', icon: <Icon icon="volume-up" color="#fff" size={12} /> },
    { type: 'builtin_image', icon: <Icon icon="media" color="#fff" size={12} /> },
    { type: 'builtin_video', icon: <Icon icon="video" color="#fff" size={12} /> },
    { type: 'builtin_location', icon: <Icon icon="map-marker" color="#fff" size={12} /> },
    { type: 'builtin_file', icon: <Icon icon="document" color="#fff" size={12} /> }
  ],
  complex: [
    { type: 'builtin_card', icon: <Card /> },
    { type: 'builtin_carousel', icon: <Carousel /> }
  ],
  prompt: [
    { type: 'builtin_actionbuttons', icon: <Icon icon="stadium-geometry" color="#fff" size={12} /> },
    { type: 'dropdown', icon: <Icon icon="th-list" color="#fff" size={12} /> },
    { type: 'builtin_single choice', icon: <Icon icon="property" color="#fff" size={12} /> }
  ],
  code: [{ type: 'code', icon: <Icon icon="lightning" color="#fff" size={12} /> }]
}

const Tags: FC<OwnProps> = ({ type, label }) => {
  function GetTag() {
    let tag = null
    for (const [key, value] of Object.entries(TagGroups)) {
      value.find((o, i) => {
        if (o.type === type) {
          tag = (
            <div className={style[`tag-${key}`]} key={i}>
              {o.icon} {label ? <span>{type}</span> : null}
            </div>
          )
        }
      })
    }
    return tag
  }

  return GetTag()
}

export default Tags
