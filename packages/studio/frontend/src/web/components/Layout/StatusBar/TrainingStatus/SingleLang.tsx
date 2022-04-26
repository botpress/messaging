import { Button, Spinner } from '@blueprintjs/core'
import axios from 'axios'
import cx from 'classnames'
import { Training, TrainError } from 'common/nlu-training'
import React, { FC, useEffect, useRef, useState } from 'react'
import { lang } from '~/components/Shared/translations'
import { AccessControl, Timeout, toastFailure } from '~/components/Shared/Utils'

import style from './style.scss'

const usePrevious = <T extends any>(value: T): T | undefined => {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

interface Props {
  dark?: boolean
  trainSession: Training
}

const BASE_NLU_URL = `${window.STUDIO_API_PATH}/nlu`

const TrainingStatusComponent: FC<Props> = (props: Props) => {
  const { trainSession, dark } = props

  const { status, progress, error } = trainSession ?? {}

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const onTrainingNeeded = () => setMessage('')
  const onTraingDone = () => setMessage(lang.tr('statusBar.ready'))
  const onCanceling = () => setMessage(lang.tr('statusBar.canceling'))
  const onTrainingError = (error: TrainError) => {
    setMessage('')
    toastFailure(error.message, Timeout.LONG, null, { delayed: 0 })
  }
  const onTrainingProgress = (progress: number) => {
    const p = Math.floor(progress * 100)
    setMessage(`${lang.tr('statusBar.training')} ${p}%`)
  }

  const prevStatus = usePrevious(status)
  useEffect(() => {
    if (status === 'training') {
      onTrainingProgress(progress ?? 0)
    } else if (error && (prevStatus === 'training' || prevStatus === 'training-pending')) {
      onTrainingError(error)
    } else if (status === 'needs-training') {
      onTrainingNeeded()
    } else if (status === 'done') {
      onTraingDone()
    }
  }, [props.trainSession])

  const onTrainClicked = async (e: React.SyntheticEvent) => {
    setLoading(true)
    e.preventDefault()
    try {
      await axios.post(`${BASE_NLU_URL}/train/${trainSession.language}`)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : `Error occured: ${err}`
      toastFailure(errMsg, Timeout.LONG, null, { delayed: 0 })
    } finally {
      setLoading(false)
    }
  }

  const onCancelClicked = async (e: React.SyntheticEvent) => {
    setLoading(true)
    e.preventDefault()
    onCanceling()
    try {
      await axios.post(`${BASE_NLU_URL}/train/${trainSession.language}/delete`)
    } catch (err) {
      console.error('cannot cancel training')
    } finally {
      setLoading(false)
    }
  }

  if (!status) {
    return null
  } else {
    return (
      <div className={style.trainStatus}>
        <span
          className={cx(
            dark ? style.trainStatus_message_dark : style.trainStatus_message_light,
            style.trainStatus_message_spaced
          )}
        >
          {message}
        </span>

        {status === 'training-pending' && (
          <div className={style.trainStatus_pending}>
            <span className={cx(style.trainStatus_pending, style.text)}>{lang.tr('statusBar.trainingPending')}</span>
            <Spinner size={5} />
          </div>
        )}
        <AccessControl resource="bot.training" operation="write">
          {status === 'needs-training' && (
            <Button minimal className={style.button} onClick={onTrainClicked} disabled={loading}>
              {lang.tr('statusBar.trainChatbot')}
            </Button>
          )}
          {status === 'training' && (
            <Button minimal className={cx(style.button, style.danger)} onClick={onCancelClicked} disabled={loading}>
              {lang.tr('statusBar.cancelTraining')}
            </Button>
          )}
        </AccessControl>
      </div>
    )
  }
}
export default TrainingStatusComponent
