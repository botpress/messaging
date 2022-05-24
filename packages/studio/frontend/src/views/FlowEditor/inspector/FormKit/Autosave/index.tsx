import { Spinner, Icon, Colors, Intent } from '@blueprintjs/core'
import { useFormikContext } from 'formik'
import { debounce } from 'lodash'
import moment from 'moment'
import React, { useState, useCallback, FC } from 'react'
import { connect } from 'react-redux'

import { getCurrentFlowNode } from '../../../../../reducers'
import { useDidMountEffect } from '../../../utils/useDidMountEffect'
import * as style from './style.module.scss'

const DEBOUNCE_MS = 2500

interface OwnProps {
  currentNode: any
}

const AutoSave: FC<OwnProps> = ({ currentNode: { lastModified } }) => {
  const [fromNow, setFromNow] = useState(moment(lastModified).fromNow())
  const { submitForm, values } = useFormikContext()

  const debouncedSubmit = useCallback(
    debounce(() => submitForm(), DEBOUNCE_MS),
    [submitForm]
  )

  useDidMountEffect(() => {
    setFromNow(moment(lastModified).fromNow())
  }, [setFromNow, lastModified])

  useDidMountEffect(() => {
    console.log('debounce', values)
    debouncedSubmit() as any
    setFromNow(null)
  }, [debouncedSubmit, values])

  return (
    <div className={style.container}>
      {!fromNow ? (
        <Spinner className={style.loading} size={18} intent={Intent.PRIMARY}>
          loading
        </Spinner>
      ) : (
        // <div className={style.saved}>
        //   <span>{fromNow}</span>
        <Icon icon="tick-circle" size={18} color={Colors.GREEN4} />
        // </div>
      )}
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
