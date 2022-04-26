import React from 'react'

export default (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.iconSize ? props.iconSize * 0.75 : 12}
    height={props.iconSize || 16}
    viewBox="0 0 12 16"
  >
    <path
      fillRule="evenodd"
      d="M7,0 L7,2 C7,2 5.2,1.9 5.2,3.1 C5.2,4 5.3,4 5.6,6 C5.7,6.9 5.1,7.5 4.5,8 C5.1,8.5 5.7,9.2 5.6,10.1 C5.4,12.1 5.2,12.1 5.2,13 C5.2,14.2 7,14 7,14 L7,14 L7,16 L7,16 L4.9,16 C3.9,16 2.8,15 3.1,12.9 C3.3,11.6 3.5,11.3 3.5,10 C3.5,9.2 2,8.5 2,8.5 L2,8.5 L2,7.5 C2,7.5 3.5,6.8 3.5,6 C3.5,4.7 3.3,4.4 3.1,3.1 C2.8,1 3.8,0 4.9,0 L4.9,0 L7,0 Z M14,0 L14,2 C14,2 12.2,1.9 12.2,3.1 C12.2,4 12.3,4 12.6,6 C12.7,6.9 12.1,7.5 11.5,8 C12.1,8.5 12.7,9.2 12.6,10.1 C12.4,12.1 12.2,12.1 12.2,13 C12.2,14.2 14,14 14,14 L14,14 L14,16 L14,16 L11.9,16 C10.9,16 9.8,15 10.1,12.9 C10.3,11.6 10.5,11.3 10.5,10 C10.5,9.2 9,8.5 9,8.5 L9,8.5 L9,7.5 C9,7.5 10.5,6.8 10.5,6 C10.5,4.7 10.3,4.4 10.1,3.1 C9.8,1 10.8,0 11.9,0 L11.9,0 L14,0 Z"
      transform="translate(-2)"
    />
  </svg>
)
