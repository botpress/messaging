import { useFormikContext } from 'formik'
import { debounce } from 'lodash'
import React, { useState, useCallback, FC } from 'react'

import { useDidMountEffect } from '../../../utils/useDidMountEffect'
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
    console.log('debounce', values)
    debouncedSubmit() as any
    setUpdating(true)
  }, [debouncedSubmit, values])

  return <div className={style.test}> {updating ? 'saving...' : 'saved!'}</div>
}

// export default connect(mapStateToProps, mapDispatchToProps)(AutoSave)
export default Autosave
