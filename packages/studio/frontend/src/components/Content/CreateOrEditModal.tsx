import { Button, Intent } from '@blueprintjs/core'
import _ from 'lodash'
import React from 'react'
import ContentForm from '~/components/ContentForm'

import { Dialog } from '../Shared/Dialog'
import { lang } from '../Shared/translations'
import withLanguage from '../Util/withLanguage'

interface Props {
  handleEdit: any
  handleCreateOrUpdate: any
  changeContentLanguage: any
  defaultLanguage: any
  contentLang: any
  isEditing: any
  formData: any
  handleClose: any
  schema: any
  uiSchema: any
  show: boolean
}

interface State {
  mustChangeLang: boolean
}

class CreateOrEditModal extends React.Component<Props, State> {
  state = {
    mustChangeLang: false
  }

  handleEdit = (event) => {
    this.props.handleEdit(event.formData)
  }

  handleSave = (event) => {
    this.props.handleCreateOrUpdate(event.formData)
  }

  useDefaultLang = () => {
    this.props.changeContentLanguage(this.props.defaultLanguage)
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.formData !== this.props.formData || this.props.contentLang !== prevProps.contentLang) {
      this.setState({ mustChangeLang: !this.props.isEditing && this.props.contentLang !== this.props.defaultLanguage })
    }
  }

  renderSwitchLang() {
    const defaultLang = this.props.defaultLanguage.toUpperCase()
    return (
      <div>
        <div style={{ height: 100 }}>
          <h4>{lang.tr('actionRequired')}</h4>
          {lang.tr('studio.content.mustBeDefaultLang')}
        </div>
        <p>
          <Button
            onClick={this.useDefaultLang}
            intent={Intent.PRIMARY}
            text={lang.tr('studio.content.switchToDefaultLang', { defaultLang })}
          />
          &nbsp;
          <Button intent={Intent.DANGER} onClick={this.props.handleClose} text={lang.tr('cancel')} />
        </p>
      </div>
    )
  }

  renderForm() {
    const formId = 'content-form'

    return (
      <ContentForm
        schema={this.props.schema}
        uiSchema={this.props.uiSchema}
        formData={this.props.formData}
        isEditing={this.props.isEditing}
        onChange={this.handleEdit}
        onSubmit={this.handleSave}
        onCancel={this.props.handleClose}
        id={formId}
      />
    )
  }

  render() {
    return (
      <Dialog.Wrapper isOpen={this.props.show} onClose={this.props.handleClose}>
        <Dialog.Body>{this.state.mustChangeLang ? this.renderSwitchLang() : this.renderForm()}</Dialog.Body>
      </Dialog.Wrapper>
    )
  }
}

export default withLanguage(CreateOrEditModal)
