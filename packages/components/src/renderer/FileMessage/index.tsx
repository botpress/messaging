import mimeTypes from 'mime/lite'
import path from 'path'
import React, { useMemo } from 'react'
import { MessageTypeHandlerProps } from '../../typings'

export const Audio: React.FC<MessageTypeHandlerProps<'audio'>> = ({ audio, title }) => {
  const mime = useMimeType(audio)
  return (
    <div>
      <span>{title}</span>
      <audio controls>
        <source src={audio} type={mime} />
      </audio>
    </div>
  )
}

export const File: React.FC<MessageTypeHandlerProps<'file'>> = ({ file, title }) => {
  return (
    <div>
      <span>File: </span>
      <a href={file} target={'_blank'}>
        {title || file}
      </a>
    </div>
  )
}

export const Video: React.FC<MessageTypeHandlerProps<'video'>> = ({ video, title }) => {
  const mime = useMimeType(video)
  return (
    <div>
      <span>{title}</span>
      <video controls>
        <source src={video} type={mime} />
      </video>
    </div>
  )
}

export const Image: React.FC<MessageTypeHandlerProps<'image'>> = ({ image, title }) => {
  return (
    <div>
      <span>{title}</span>
      <img src={image} alt={title} />
    </div>
  )
}

const useMimeType = (url: string): string | undefined => {
  return useMemo(() => mimeTypes.getType(path.extname(url)) || undefined, [url])
}
