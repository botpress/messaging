import { Formik } from 'formik'
import React, { FC } from 'react'

import Autosave from './Autosave'

interface OwnProps {
  initialValues: any
  onSubmit: any
}

const FormKit: FC<OwnProps> = ({ initialValues, onSubmit, children }) => {
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      <>
        {children}
        <Autosave />
      </>
    </Formik>
  )
}

export default FormKit
export * from './components'
