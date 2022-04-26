import { Tag } from '@blueprintjs/core'
import { NLU } from 'botpress/sdk'
import React from 'react'
import confirmDialog from '~/components/Shared/ConfirmDialog'
import { lang } from '~/components/Shared/translations'

import style from '../style.scss'

interface State {}
interface Props {
  key: string
  slot: NLU.SlotDefinition
  onDelete: (slot: NLU.SlotDefinition) => void
  onEdit: (slot: NLU.SlotDefinition) => void
}

export default class SlotItem extends React.Component<Props, State> {
  handleDeleteClicked = async (e) => {
    e.preventDefault()

    if (
      await confirmDialog(lang.tr('nlu.slots.deleteMessage'), {
        acceptLabel: lang.tr('delete')
      })
    ) {
      this.props.onDelete && this.props.onDelete(this.props.slot)
    }
  }

  handleEditClicked = (e) => {
    e.preventDefault()
    this.props.onEdit && this.props.onEdit(this.props.slot)
  }

  render() {
    // TODO replace edit link with a simple click on the tag
    // TODO replace delete link with simple click on the remove tag
    const { slot } = this.props
    return (
      <li className={style.entityItem}>
        <Tag className={style[`label-colors-${slot.color}`]} round large>
          {slot.name}
        </Tag>
        <a onClick={this.handleDeleteClicked} className={style.link}>
          {lang.tr('delete')}
        </a>
        <a onClick={this.handleEditClicked} className={style.link}>
          {lang.tr('edit')}
        </a>
      </li>
    )
  }
}
