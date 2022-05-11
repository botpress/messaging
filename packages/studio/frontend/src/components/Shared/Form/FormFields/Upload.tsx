import { FileInput, Icon } from '@blueprintjs/core'
import React, { FC, Fragment, useState } from 'react'

import * as sharedStyle from '../../../Shared/style.module.scss'
import FileDisplay from '../../FileDisplay'
import { UploadFieldProps } from './typings'

const Upload: FC<UploadFieldProps> = (props) => {
  const [error, setError] = useState<string>()

  const deleteFile = () => {
    setError(undefined)
    props.onChange?.(undefined)
  }

  const startUpload = async (event: React.FormEvent<HTMLInputElement>) => {
    setError(undefined)

    const data = new FormData()
    data.append('file', (event.target as HTMLInputElement).files[0])

    try {
      const {
        data: { url }
      } = await props.axios.post<{ url: string }>(props.customPath ? props.customPath : 'media', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      props.onChange?.(url)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const { value, type, filter } = props

  const allowedMimeTypes = () => {
    if (filter) {
      return filter
    } else if (type) {
      // e.g. video/*, audio/*, ...
      return `${type}/*`
    } else {
      return '*'
    }
  }

  return (
    <div className={sharedStyle.fieldWrapper}>
      {value && <FileDisplay url={value} type={type} onDelete={deleteFile} deletable />}
      {!value && (
        <Fragment>
          <FileInput
            text={<Icon icon="upload" />}
            large
            inputProps={{
              accept: allowedMimeTypes(),
              onChange: startUpload
            }}
          />
          {error && <p className={sharedStyle.fieldError}>{error}</p>}
        </Fragment>
      )}
    </div>
  )
}

export default Upload
