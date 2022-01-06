import mimeTypes from 'mime/lite'
import React, { FC, useRef, useEffect } from 'react'
import { MessageTypeHandlerProps } from '../typings'

export const VoiceMessage: FC<MessageTypeHandlerProps<'voice'>> = ({ audio, config }) => {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (config.onAudioEnded) {
      audioRef.current?.addEventListener('ended', config.onAudioEnded)

      return () => audioRef.current?.removeEventListener('ended', config.onAudioEnded!)
    }
  }, [config.onAudioEnded])

  useEffect(() => {
    // Simulate an autoplay by playing every voice messages of a single message group one after the other
    if (config.shouldPlay) {
      audioRef.current?.play().catch((err: Error) => {
        console.error(`An error occured while playing the voice message: ${err.message}`)
      })
    }
  }, [config.shouldPlay])

  if (!audio) {
    return null
  }

  const extension = audio.substring(audio.lastIndexOf('.') + 1)
  const mime = mimeTypes.getType(extension)

  return (
    <audio controls ref={audioRef}>
      <source src={audio} type={mime || 'audio/mpeg'} />
    </audio>
  )
}
