import mimeTypes from 'mime/lite'
import React, { useMemo } from 'react'
import { MessageTypeHandlerProps } from '../typings'

export const Audio: React.FC<MessageTypeHandlerProps<'audio'>> = ({ audio, audioUrl, title, config }) => {
  const mime = useMimeType(audioUrl || audio!)
  if (!mime) {
    return <File file={audio} title={title} config={config} />
  }
  return (
    <div>
      <span>{title}</span>
      <audio controls>
        <source src={audioUrl || audio} type={mime} />
      </audio>
    </div>
  )
}

export const File: React.FC<MessageTypeHandlerProps<'file'>> = ({ file, fileUrl, title }) => {
  return (
    <div>
      <span>File: </span>
      <a href={fileUrl || file} target={'_blank'} rel="noopener noreferrer">
        {title || file}
      </a>
    </div>
  )
}

export const Video: React.FC<MessageTypeHandlerProps<'video'>> = ({ video, videoUrl, title, config }) => {
  const mime = useMimeType(videoUrl || video!)
  if (!mime) {
    return <File file={videoUrl || video} title={title} config={config} />
  }
  return (
    <div>
      <span>{title}</span>
      <video controls width={'100%'}>
        <source src={videoUrl || video} type={mime} />
      </video>
    </div>
  )
}

export const Image: React.FC<MessageTypeHandlerProps<'image'>> = ({ image, imageUrl, title }) => {
  return (
    <div>
      <span>{title}</span>
      <img src={imageUrl || image} alt="" />
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
