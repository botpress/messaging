import { Button, Callout, Classes, Dialog, FormGroup, InputGroup, Intent } from '@blueprintjs/core'
import { EditableFile, FilesDS } from 'common/code-editor'
import _ from 'lodash'
import React, { FC, useEffect, useState } from 'react'
import { lang } from '~/components/Shared/translations'

interface Props {
  isOpen: boolean
  toggle: () => void
  createFile: (newName: string) => void
  renameFile: (file: EditableFile, newName: string) => void
  files?: FilesDS
  selectedFile?: EditableFile
}

const sanitizeName = (text: string) =>
  text
    .replace(/\s/g, '-')
    .replace(/[^a-zA-Z0-9\/_.-]/g, '')
    .replace(/\/\//, '/')

const NameModal: FC<Props> = (props) => {
  const [name, setName] = useState('')

  useEffect(() => {
    props.selectedFile ? setName(props.selectedFile.location) : setName('')
  }, [props.isOpen])

  const submit = async (e) => {
    e.preventDefault()
    if (props.selectedFile) {
      props.renameFile(props.selectedFile, name)
    } else {
      props.createFile(name)
    }

    closeModal()
  }

  const closeModal = () => {
    setName('')
    props.toggle()
  }

  if (!props.files) {
    return null
  }

  const alreadyExists = !!(props.files['raw'] || []).find((x) => x.location === sanitizeName(name))

  return (
    <Dialog
      isOpen={props.isOpen}
      onClose={closeModal}
      transitionDuration={0}
      icon={props.selectedFile ? 'edit' : 'add'}
      title={
        props.selectedFile
          ? lang.tr('code-editor.nameModal.renameOrMoveFile')
          : lang.tr('code-editor.nameModal.createNewFile')
      }
    >
      <form onSubmit={submit}>
        <div className={Classes.DIALOG_BODY}>
          <FormGroup label={lang.tr('code-editor.nameModal.fileName')}>
            <InputGroup
              id="input-name"
              tabIndex={1}
              placeholder={lang.tr('code-editor.nameModal.chooseNameForFile')}
              value={name}
              onChange={(e) => setName(sanitizeName(e.currentTarget.value))}
              required
              autoFocus
            />
          </FormGroup>

          {alreadyExists && (
            <Callout intent={Intent.WARNING}>{lang.tr('code-editor.nameModal.nameAlreadyExists')}</Callout>
          )}
        </div>

        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              type="submit"
              id="btn-submit"
              text={lang.tr('submit')}
              intent={Intent.PRIMARY}
              onClick={submit}
              disabled={!name || alreadyExists}
            />
          </div>
        </div>
      </form>
    </Dialog>
  )
}

export default NameModal
