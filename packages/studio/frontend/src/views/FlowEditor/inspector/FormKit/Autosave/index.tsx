import { useFormikContext } from 'formik'
import { debounce } from 'lodash'
import React, { useState, useCallback, useEffect, useRef, useMemo, FC } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import { getCurrentFlowNode } from '../../../../../reducers'
import * as style from './style.module.scss'

const DEBOUNCE_MS = 4000

interface OwnProps {
  currentNode: any
}

const useDidMountEffect = (func, deps) => {
  const didMount = useRef(false)

  useEffect(() => {
    if (didMount.current) func()
    else didMount.current = true
  }, deps)
}

const AutoSave: FC<OwnProps> = ({ currentNode }) => {
  const [fromNow, setFromNow] = useState('some time ago lmao xd')
  const { submitForm, values, isSubmitting, resetForm } = useFormikContext()

  const debouncedSubmit = useCallback(
    debounce(() => submitForm(), DEBOUNCE_MS),
    [submitForm]
  )

  useDidMountEffect(() => {
    resetForm()
  }, [resetForm, currentNode])

  useDidMountEffect(() => {
    console.log('why', values)
    debouncedSubmit()
  }, [debouncedSubmit, values])

  return (
    <div className={style.test}>
      {' '}
      {isSubmitting ? 'saving...' : fromNow !== null ? `Last Saved: ${fromNow}` : null}
    </div>
  )
}

const mapStateToProps = (state) => ({
  currentNode: getCurrentFlowNode(state as never) as any
})

const mapDispatchToProps = {
  // deleteFlow,
  // duplicateFlow,
  // renameFlow
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoSave)
