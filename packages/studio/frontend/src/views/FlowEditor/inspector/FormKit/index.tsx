import { Formik, FormikConfig } from 'formik'
import React, { FC } from 'react'

import { Selfsave } from './formHooks'
import { FormValues } from './shared'

interface OwnProps {
  initialValues: FormValues
  onSubmit: FormikConfig<FormValues>['onSubmit']
}

const FormKit: FC<OwnProps> = ({ initialValues, onSubmit, children }) => {
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} enableReinitialize>
      <>
        <Selfsave />
        {children}
      </>
    </Formik>
  )
}

export default FormKit
export * from './components'
