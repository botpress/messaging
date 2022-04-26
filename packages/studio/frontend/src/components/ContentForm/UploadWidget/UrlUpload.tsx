import { Button, Icon, Intent, Position, Tooltip } from '@blueprintjs/core'
import React, { FC, Fragment, useEffect, useState } from 'react'
import FileDisplay from '~/components/Shared/FileDisplay'
import { UploadFieldProps } from '~/components/Shared/Form/FormFields/typings'
import { lang } from '~/components/Shared/translations'
import SmartInput from '~/components/SmartInput'

import parentStyle from '../style.scss'
import style from './style.scss'

interface IUrlUploadProps {
  value: string | null
  type: UploadFieldProps['type']
  onChange(value: string | null): void
  onError(value: string): void
  onDelete(): void
}

const UrlUpload: FC<IUrlUploadProps> = (props) => {
  const { value, type } = props

  const [url, setUrl] = useState(props.value)

  useEffect(() => {
    setUrl(value)
  }, [value])

  const handleUrlChange = (str: string) => {
    setUrl(str)
  }

  const onDelete = () => {
    setUrl(null)
    props.onDelete()
  }

  const saveUrl = () => {
    props.onChange(url)
  }

  const isUrlOrRelativePath = (str: string) => {
    const re = /^(?:[a-z]+:)?\/\/|^\//i

    return re.test(str)
  }

  const urlHasDoubleBraces = new RegExp('(^|[^{]){{[^{]', 'g').test(url)

  return (
    <div className={parentStyle.fieldWrapper}>
      {value && isUrlOrRelativePath(value) && <FileDisplay url={value} type={type} onDelete={onDelete} deletable />}

      {value && !isUrlOrRelativePath(value) && (
        <div className={style.expressionWrapper}>
          {lang.tr('contentTypes.infoInterpreted')} <span className={style.italic}>{value}</span>
          <div className={style.expressionWrapperActions}>
            <Tooltip content={lang.tr('delete')} position={Position.TOP}>
              <Button minimal small intent={Intent.DANGER} icon="trash" onClick={onDelete}></Button>
            </Tooltip>
          </div>
        </div>
      )}

      {!value && (
        <Fragment>
          <div className={style.flexContainer}>
            <SmartInput singleLine className={parentStyle.textarea} value={url} onChange={handleUrlChange} />

            <Button intent={Intent.NONE} onClick={saveUrl}>
              {lang.tr('ok')}
            </Button>
          </div>
          {urlHasDoubleBraces && (
            <div>
              <span className={parentStyle.warning}>
                <Icon icon="warning-sign" />

                {lang.tr('studio.content.tripleBracesWarning')}
              </span>
            </div>
          )}
        </Fragment>
      )}
    </div>
  )
}

export default UrlUpload
