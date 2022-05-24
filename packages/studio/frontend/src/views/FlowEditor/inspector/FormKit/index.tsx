import { Formik } from 'formik'
import React, { FC } from 'react'

interface OwnProps {
  initialValues: any
  onSubmit: any
}

const FormKit: FC<OwnProps> = ({ initialValues, onSubmit, children }) => {
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      <>{children}</>
    </Formik>
  )
}

export default FormKit
export * from './components'
