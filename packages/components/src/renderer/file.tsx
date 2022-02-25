import mimeTypes from 'mime/lite'
import React, { useMemo } from 'react'
import { MessageTypeHandlerProps } from '../typings'

export const Audio: React.FC<MessageTypeHandlerProps<'audio'>> = ({ audio, title, config }) => {
  const mime = useMimeType(audio)
  if (!mime) {
    return <File file={audio} title={title} config={config} />
  }
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
      <a href={file} target={'_blank'} rel="noopener noreferrer">
        {title || file}
      </a>
    </div>
  )
}

export const Video: React.FC<MessageTypeHandlerProps<'video'>> = ({ video, title, config }) => {
  const mime = useMimeType(video)
  if (!mime) {
    return <File file={video} title={title} config={config} />
  }
  return (
    <div>
      <span>{title}</span>
      <video controls width={'100%'}>
        <source src={video} type={mime} />
      </video>
    </div>
  )
}

export const Image: React.FC<MessageTypeHandlerProps<'image'>> = ({ image, title }) => {
  return (
    <div>
      <span>{title}</span>
      <img src={image} alt="" />
    </div>
  )
}

const useMimeType = (url: string): string | null => {
  let extension: string | null = null
  return useMemo(() => {
    try {
      const validUrl = new URL(url)
      extension = validUrl.pathname
    } catch (error) {
      extension = url.substring(url.lastIndexOf('.') + 1)
    }
    return extension && mimeTypes.getType(extension)
  }, [url])
}
