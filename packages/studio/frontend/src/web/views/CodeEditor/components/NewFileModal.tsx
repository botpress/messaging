import { Button, Checkbox, Classes, Dialog, FormGroup, InputGroup, Intent, Radio, RadioGroup } from '@blueprintjs/core'
import { FileTypes, FilesDS, BOT_SCOPED_HOOKS } from 'common/code-editor'
import { ALL_BOTS } from 'common/utils'
import _ from 'lodash'
import React, { FC, useEffect, useState } from 'react'
import { lang } from '~/components/Shared/translations'

import { httpAction, legacyAction } from '../utils/templates'

interface Props {
  isOpen: boolean
  toggle: () => void
  openFile: (args: any) => void
  files?: FilesDS
  selectedType: string
  selectedHookType: string
  hasPermission(perm: string, isWrite?: boolean): boolean
}

const sanitizeName = (text: string) =>
  text
    .replace(/\s/g, '-')
    .replace(/[^a-zA-Z0-9\/_.-]/g, '')
    .replace(/\/\//, '/')

const NewFileModal: FC<Props> = (props) => {
  const [name, setName] = useState('')

  useEffect(() => {
    setName('')
  }, [props.isOpen])

  const submit = async (e) => {
    e.preventDefault()

    const finalName = name.endsWith('.js') || name.endsWith('.json') ? name : `${name}.js`
    const isJs = finalName.endsWith('.js')
    const isJson = finalName.endsWith('.json')

    let content = ' '
    if (props.selectedType === 'action_legacy' && isJs) {
      content = legacyAction
    } else if (props.selectedType === 'action_http' && isJs) {
      content = httpAction
    } else if (isJson) {
      content = '{\n\t\n}'
    }

    await props.openFile({
      name: finalName,
      location: finalName,
      content,
      type: props.selectedType,
      hookType: props.selectedHookType,
      botId: window.BOT_ID
    })

    closeModal()
  }

  const closeModal = () => {
    setName('')
    props.toggle()
  }

  if (!props.selectedType) {
    return null
  }

  const fileDefinition = FileTypes[props.selectedType]
  const canGlobalWrite = props.hasPermission(`global.${fileDefinition.permission}`, true)

  return (
    <Dialog
      isOpen={props.isOpen}
      onClose={closeModal}
      transitionDuration={0}
      icon="add"
      title={lang.tr('code-editor.newFileModal.createNew', { name: props.selectedType })}
    >
      <form onSubmit={submit}>
        <div className={Classes.DIALOG_BODY}>
          <FormGroup
            label={lang.tr('code-editor.newFileModal.fileName')}
            helperText={lang.tr('code-editor.newFileModal.fileNameHelp')}
          >
            <InputGroup
              id="input-name"
              tabIndex={1}
              placeholder="my-file.js"
              value={name}
              onChange={(e) => setName(sanitizeName(e.currentTarget.value))}
              required
              autoFocus
            />
          </FormGroup>
        </div>

        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              type="submit"
              id="btn-submit-new-file"
              text={lang.tr('submit')}
              intent={Intent.PRIMARY}
              onClick={submit}
              disabled={!name}
            />
          </div>
        </div>
      </form>
    </Dialog>
  )
}

export default NewFileModal
