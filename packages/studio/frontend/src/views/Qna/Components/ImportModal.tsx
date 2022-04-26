import { Button, Callout, Classes, Dialog, FileInput, FormGroup, Intent, Radio, RadioGroup } from '@blueprintjs/core'
import 'bluebird-global'
import axios from 'axios'
import _ from 'lodash'
import React, { FC, Fragment, useState } from 'react'
import { toast } from '~/components/Shared/Toaster'
import { lang } from '~/components/Shared/translations'

const axiosConfig = { headers: { 'Content-Type': 'multipart/form-data' } }

interface Props {
  onImportCompleted: () => void
  isOpen: boolean
  toggle: () => void
}

interface Analysis {
  qnaCount: number
  cmsCount: number
  fileQnaCount: number
  fileCmsCount: number
}

export const ImportModal: FC<Props> = (props) => {
  const [file, setFile] = useState<any>()
  const [filePath, setFilePath] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [importAction, setImportAction] = useState('insert')
  const [analysis, setAnalysis] = useState<Analysis>()
  const [uploadStatus, setUploadStatus] = useState<string>()
  const [hasError, setHasError] = useState(false)

  const analyzeImport = async () => {
    setIsLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)

      const { data } = await axios.post(`${window.STUDIO_API_PATH}/qna/analyzeImport`, form, axiosConfig)

      if (!data.fileQnaCount && !data.fileCmsCount) {
        setUploadStatus(lang.tr('qna.import.notAbleToExtract'))
        setHasError(true)
      }

      setAnalysis(data)
    } catch (err) {
      toast.failure(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const submitChanges = async () => {
    setIsLoading(true)

    try {
      const form = new FormData()
      form.append('file', file)
      form.append('action', importAction)
      await axios.post(`${window.STUDIO_API_PATH}/qna/import`, form, axiosConfig)
      props.onImportCompleted()
      toast.success(lang.tr('qna.import.uploadSuccessful'))
      closeDialog()
    } catch (err) {
      setHasError(true)
      toast.failure(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const readFile = (files: FileList | null) => {
    if (files) {
      setFile(files[0])
      setFilePath(files[0].name)
    }
  }

  const closeDialog = () => {
    clearState()
    props.toggle()
  }

  const clearState = () => {
    setFilePath(undefined)
    setFile(undefined)
    setUploadStatus(undefined)
    setAnalysis(undefined)
    setHasError(false)
  }

  const renderUpload = () => {
    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          readFile(e.dataTransfer.files)
        }}
      >
        <div className={Classes.DIALOG_BODY}>
          <FormGroup
            label={<span>{lang.tr('qna.import.selectJson')}</span>}
            labelFor="input-archive"
            helperText={<span>{lang.tr('qna.import.selectJsonHelp')}</span>}
          >
            <FileInput
              text={filePath || lang.tr('chooseFile')}
              onChange={(e) => readFile((e.target as HTMLInputElement).files)}
              inputProps={{ accept: '.json' }}
              fill
            />
          </FormGroup>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              id="btn-next"
              text={isLoading ? lang.tr('pleaseWait') : lang.tr('next')}
              disabled={!filePath || !file || isLoading}
              onClick={analyzeImport}
              intent={Intent.PRIMARY}
            />
          </div>
        </div>
      </div>
    )
  }

  const renderAnalysis = () => {
    const { qnaCount, cmsCount, fileQnaCount, fileCmsCount } = analysis

    return (
      <Fragment>
        <div className={Classes.DIALOG_BODY}>
          <div>
            <p>
              {lang.tr('qna.import.fileContains', {
                fileQnaCount: <strong>{fileQnaCount}</strong>,
                fileCmsCount: <strong>{fileCmsCount}</strong>
              })}
              <br />
              <br />
              {lang.tr('qna.import.botContains', {
                qnaCount: <strong>{qnaCount}</strong>,
                cmsCount: <strong>{cmsCount}</strong>
              })}
            </p>

            <p style={{ marginTop: 30 }}>
              <RadioGroup
                label={lang.tr('qna.import.whatLikeDo')}
                onChange={(e) => setImportAction(e.target['value'])}
                selectedValue={importAction}
              >
                <Radio id="radio-insert" label={lang.tr('qna.import.insertNewQuestions')} value="insert" />
                <Radio
                  id="radio-clearInsert"
                  label={lang.tr('qna.import.clearQuestionsThenInsert')}
                  value="clear_insert"
                />
                <Callout intent="warning">{lang.tr('qna.import.clearQuestionsAnalyticsWarning')}</Callout>
              </RadioGroup>
            </p>
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button id="btn-back" text={lang.tr('back')} disabled={isLoading} onClick={clearState} />
            <Button
              id="btn-submit"
              text={isLoading ? lang.tr('pleaseWait') : lang.tr('submit')}
              disabled={isLoading || hasError}
              onClick={submitChanges}
              intent={Intent.PRIMARY}
            />
          </div>
        </div>
      </Fragment>
    )
  }

  const renderStatus = () => {
    return (
      <Fragment>
        <div className={Classes.DIALOG_BODY}>
          <Callout
            title={hasError ? lang.tr('error') : lang.tr('qna.import.uploadStatus')}
            intent={hasError ? Intent.DANGER : Intent.PRIMARY}
          >
            {uploadStatus}
          </Callout>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            {hasError && <Button id="btn-back" text={lang.tr('back')} disabled={isLoading} onClick={clearState} />}
          </div>
        </div>
      </Fragment>
    )
  }

  const showStatus = uploadStatus || hasError

  return (
    <Fragment>
      <Dialog
        title={analysis ? lang.tr('qna.import.analysis') : lang.tr('qna.import.uploadFile')}
        icon="import"
        isOpen={props.isOpen}
        onClose={closeDialog}
        transitionDuration={0}
      >
        {showStatus && renderStatus()}
        {!showStatus && (analysis ? renderAnalysis() : renderUpload())}
      </Dialog>
    </Fragment>
  )
}
