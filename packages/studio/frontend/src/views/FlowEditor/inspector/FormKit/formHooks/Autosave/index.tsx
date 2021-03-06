import { Spinner, Icon, Colors, Intent } from '@blueprintjs/core'
import { useFormikContext } from 'formik'
import { debounce } from 'lodash'
import React, { useState, useCallback, FC } from 'react'

import { useDidMountEffect } from '../../../../utils/useDidMountEffect'
import * as style from './style.module.scss'

const DEBOUNCE_MS = 2500

interface OwnProps {}

const Autosave: FC<OwnProps> = () => {
  const [updating, setUpdating] = useState(null)
  const { submitForm, values, isSubmitting } = useFormikContext()

  const debouncedSubmit = useCallback(
    debounce(() => submitForm(), DEBOUNCE_MS),
    [submitForm]
  )

  useDidMountEffect(() => {
    if (!isSubmitting) {
      setUpdating(false)
    }
  }, [isSubmitting, setUpdating])

  useDidMountEffect(() => {
    if (!updating) {
      setUpdating(true)
    }
    const debSubmit = debouncedSubmit() as any
    return () => debSubmit.cancel()
  }, [debouncedSubmit, values])

  return (
    <div className={style.container}>
      {updating ? (
        <Spinner size={18} intent={Intent.PRIMARY}>
          loading
        </Spinner>
      ) : (
        <Icon icon="tick-circle" size={18} color={Colors.GREEN4} className={style.success} />
      )}
    </div>
  )
}

export default Autosave
