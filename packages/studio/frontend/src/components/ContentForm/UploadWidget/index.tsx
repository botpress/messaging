import axios from 'axios'
import cn from 'classnames'
import { isBpUrl } from 'common/url'
import React, { FC, Fragment, useState } from 'react'
import FormFields from '~/components/Shared/Form/FormFields'
import { SupportedFileType } from '~/components/Shared/Form/FormFields/typings'
import { lang } from '~/components/Shared/translations'
import { AccessControl } from '~/components/Shared/Utils'

import { Schema } from '../typings'

import style from './style.scss'
import UrlUpload from './UrlUpload'
interface IUploadWidgetProps {
  value: string | null
  onChange(value: string | null): void
  schema: Schema & {
    $subtype: SupportedFileType
  }
}

const UploadWidget: FC<IUploadWidgetProps> = (props) => {
  const { value } = props
  const [error, setError] = useState<string>(null)
  const [enterUrlManually, setEnterUrlManually] = useState(false)

  React.useEffect(() => {
    if (value) {
      setEnterUrlManually(!isBpUrl(value))
    }
  }, [])

  const validate = (value: string | null): Error | undefined => {
    if (!value || !value.trim()) {
      return new Error('Value must not be empty')
    }
  }

  const onError = (error: string) => {
    setError(error)
  }

  const onChange = (value: string | null, allowEmpty: boolean = false) => {
    const error = validate(value)
    if (error && !allowEmpty) {
      return setError(error.message)
    }

    props.onChange(value)
    setError(null)
  }

  const onDelete = () => {
    props.onChange(null)
  }

  const handleToggleManually = () => {
    setEnterUrlManually(!enterUrlManually)
    setError(null)
  }

  const { $subtype: subtype, $filter: filter } = props.schema

  return (
    <AccessControl
      operation="write"
      resource="bot.media"
      fallback={<em>{lang.tr('contentTypes.permissionDenied')}</em>}
    >
      <Fragment>
        {!enterUrlManually && (
          <FormFields.Upload
            axios={axios.create({ baseURL: window.STUDIO_API_PATH })}
            onChange={(value) => onChange(value, true)}
            value={value}
            type={subtype}
            filter={filter}
          />
        )}

        {enterUrlManually && (
          <UrlUpload value={value} type={subtype} onChange={onChange} onDelete={onDelete} onError={onError} />
        )}

        {!value && (
          <div className={style.fieldContainer}>
            <a className={style.toggleLink} onClick={handleToggleManually}>
              {!enterUrlManually ? lang.tr('contentTypes.enterUrlChoice') : lang.tr('contentTypes.uploadFileChoice')}
            </a>

            {error && <p className={cn(style.fieldError, style.fieldError)}>{error}</p>}
          </div>
        )}
      </Fragment>
    </AccessControl>
  )
}

export default UploadWidget
