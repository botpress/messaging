import { Button, Classes, ControlGroup, InputGroup } from '@blueprintjs/core'
import { ContentElement, FormData } from 'botpress/sdk'
import isEqual from 'lodash/isEqual'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { deleteMedia, fetchContentItem, upsertContentItem } from '~/actions'
import { lang } from '~/components/Shared/translations'
import store from '~/store'
import { CONTENT_TYPES_MEDIA } from '~/util/ContentDeletion'
import ActionItem from '~/views/FlowBuilder/common/action'

import withLanguage from '../../Util/withLanguage'
import CreateOrEditModal from '../CreateOrEditModal'

import style from './style.scss'

interface DispatchProps {
  deleteMedia: (formData: any) => Promise<void>
  fetchContentItem: (itemId: string, query?: { force?: boolean; batched?: boolean }) => Promise<void>
  upsertContentItem: (item: any) => Promise<void>
}

interface StateProps {
  contentItem?: ContentElement
  contentType: string
  contentLang: string
}

interface State {
  showItemEdit: boolean
  contentToEdit: FormData
}

export interface OwnProps {
  itemId: string
  placeholder: string
  inputId?: string
  layoutv2?: boolean
  style?: React.CSSProperties
  id?: string
  name?: string
  onChange: (item: ContentElement) => void
  onUpdate?: () => void
  refresh?: () => void
}

type Props = DispatchProps & StateProps & OwnProps

const DEFAULT_SCHEMA: ContentElement['schema'] = { json: {}, ui: {}, title: '', renderer: '' }

class ContentPickerWidget extends Component<Props, State> {
  state: State = {
    showItemEdit: false,
    contentToEdit: null
  }

  async componentDidMount() {
    await this.props.fetchContentItem(this.props.itemId)
  }

  componentDidUpdate(prevProps: Props) {
    if (!this.props.contentItem && prevProps.itemId !== this.props.itemId) {
      return this.props.fetchContentItem(this.props.itemId)
    }
  }

  editItem = () => {
    this.setState({ showItemEdit: true, contentToEdit: this.props.contentItem?.formData })
  }

  handleUpdate = async () => {
    const { contentItem, itemId } = this.props
    const { contentType } = contentItem

    await this.props.upsertContentItem({ modifyId: itemId, contentType, formData: this.state.contentToEdit })
    await this.props.fetchContentItem(this.props.itemId, { force: true })

    this.props.refresh?.()
    this.props.onUpdate?.()

    this.setState({ showItemEdit: false })
  }

  onChange = async (item: ContentElement) => {
    await this.props.fetchContentItem(item?.id)
    this.props.onChange(item)
  }

  handleClose = async () => {
    if (
      CONTENT_TYPES_MEDIA.includes(this.props.contentItem.contentType) &&
      !isEqual(this.state.contentToEdit, this.props.contentItem.formData)
    ) {
      await this.props.deleteMedia(this.state.contentToEdit)
    }

    this.setState({ showItemEdit: false, contentToEdit: null })
  }

  renderModal() {
    const schema = this.props.contentItem?.schema || DEFAULT_SCHEMA

    return (
      <CreateOrEditModal
        show={this.state.showItemEdit}
        schema={schema.json}
        uiSchema={schema.ui}
        isEditing={this.state.contentToEdit !== null}
        handleClose={this.handleClose}
        formData={this.state.contentToEdit}
        handleEdit={(contentToEdit) => this.setState({ contentToEdit })}
        handleCreateOrUpdate={this.handleUpdate}
      />
    )
  }

  render() {
    const { inputId, contentItem, placeholder } = this.props
    const contentType = contentItem?.contentType || this.props.contentType
    const schema = contentItem?.schema || DEFAULT_SCHEMA

    const textContent =
      (contentItem && `${lang.tr(schema.title)} | ${contentItem.previews[this.props.contentLang]}`) || ''
    const actionText = (contentItem && 'say #!' + contentItem.id) || 'say '

    if (this.props.layoutv2) {
      return contentItem ? <ActionItem text={actionText} layoutv2={true} /> : null
    }

    return (
      <ControlGroup fill>
        <div
          className={style.clickableInput}
          onClick={() => (contentItem ? this.editItem() : window.botpress.pickContent({ contentType }, this.onChange))}
        >
          <InputGroup
            placeholder={placeholder}
            value={textContent}
            disabled
            id={inputId || ''}
            className={style.contentInput}
          />
          {contentItem && <Button icon="edit" className={Classes.FIXED} />}
        </div>
        <Button
          icon="folder-open"
          onClick={() => window.botpress.pickContent({ contentType }, this.onChange)}
          className={Classes.FIXED}
        />
        {this.renderModal()}
      </ControlGroup>
    )
  }
}

const mapDispatchToProps = { deleteMedia, fetchContentItem, upsertContentItem }
const mapStateToProps = ({ content: { itemsById } }, { itemId }) => ({ contentItem: itemsById[itemId] })

const ConnectedContentPicker = connect<DispatchProps, StateProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(withLanguage(ContentPickerWidget))

// Passing store explicitly since this component may be imported from another botpress-module
export default (props: Partial<StateProps> & OwnProps) => <ConnectedContentPicker {...props} store={store} />
