import { Spinner, Icon, Colors, Intent } from '@blueprintjs/core'
import { useFormikContext } from 'formik'
import React, { useState, useCallback, useRef, FC } from 'react'

import { useDidMountEffect } from '../../../../utils/useDidMountEffect'
import * as style from './style.module.scss'

interface OwnProps {}

// @LEGACY: remove when autosave can be added
const Selfsave: FC<OwnProps> = () => {
  const [updating, setUpdating] = useState(null)
  const [dirty, setDirty] = useState(false)
  const { submitForm, values, isSubmitting } = useFormikContext()
  const haltDirty = useRef(false)

  const handleSave = useCallback(() => {
    haltDirty.current = true
    submitForm()
      .then(() => setDirty(false))
      .catch(() => {})
  }, [submitForm, setDirty])

  useDidMountEffect(() => {
    if (!isSubmitting) {
      setUpdating(false)
    }
  }, [isSubmitting, setUpdating])

  useDidMountEffect(() => {
    if (!dirty && !haltDirty.current) {
      setDirty(true)
    } else {
      haltDirty.current = false
    }
  }, [values])

  return (
    <div className={style.container}>
      {updating ? (
        //  @TRANSLATE
        <Spinner size={18} intent={Intent.PRIMARY}>
          loading
        </Spinner>
      ) : dirty ? (
        // @TRANSLATE
        <div className={style.saveBtn} onClick={handleSave}>
          Save
        </div>
      ) : (
        <Icon icon="tick-circle" size={18} color={Colors.GREEN4} className={style.success} />
      )}
    </div>
  )
}

export default Selfsave
