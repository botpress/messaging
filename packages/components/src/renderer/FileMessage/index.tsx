import mimeTypes from 'mime/lite'
import React from 'react'
import path from 'path'
import { MessageTypeHandlerProps } from '../../typings'

export const File = ({ payload }: MessageTypeHandlerProps<'file' | 'video' | 'audio'>) => {
  if (!payload) {
    return null
  }

  const { url, title } = payload

  let extension = ''
  try {
    const validUrl = new URL(url)

    extension = validUrl.pathname
  } catch (error) {
    // Try using path.extname since url might be relative.
    extension = path.extname(url)
  }

  const mime = mimeTypes.getType(extension)

  if (mime?.includes('image/')) {
    return (
      <a href={url} target={'_blank'}>
        <img src={url} title={title} />
      </a>
    )
  } else if (mime?.includes('audio/')) {
    return (
      <audio controls>
        <source src={url} type={mime} />
      </audio>
    )
  } else if (mime?.includes('video/')) {
    return (
      <video controls>
        <source src={url} type={mime} />
      </video>
    )
  }

  return (
    <div>
      <span>File: </span>
      <a href={url} target={'_blank'}>
        {title || url}
      </a>
    </div>
  )
}
