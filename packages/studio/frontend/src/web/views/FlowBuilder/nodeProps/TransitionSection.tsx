import classnames from 'classnames'
import _ from 'lodash'
import React, { Component, Fragment } from 'react'

import { Button, Label } from 'react-bootstrap'
import { lang } from '~/components/Shared/translations'

import ConditionItem from '../common/condition'

import ConditionModalForm from './ConditionModalForm'

const style = require('./style.scss')

export default class TransitionSection extends Component<any, any> {
  state: any = {
    showConditionalModalForm: false
  }

  onMove(prevIndex, direction) {
    const clone = [...this.props.items]
    const a = clone[prevIndex]
    const b = clone[prevIndex + direction]

    clone[prevIndex + direction] = a
    clone[prevIndex] = b

    this.props.onItemsUpdated(clone)
  }

  onSubmit = (item) => {
    const editIndex = this.state.itemToEditIndex
    const { items } = this.props
    const updateByIndex = (originalItem, i) => (i === editIndex ? item : originalItem)
    this.setState({ showConditionalModalForm: false, itemToEditIndex: null })
    this.props.onItemsUpdated(Number.isInteger(editIndex) ? items.map(updateByIndex) : [...items, item])
  }

  onRemove(index) {
    const clone = [...this.props.items]
    _.pullAt(clone, [index])
    this.props.onItemsUpdated(clone)
  }

  onCopyAction(index) {
    this.props.copyItem(this.props.items[index])
  }

  onEdit(itemToEditIndex) {
    this.setState({ itemToEditIndex, showConditionalModalForm: true })
  }

  render() {
    // eslint-disable-next-line prefer-const
    let { items, readOnly } = this.props

    if (!items) {
      items = []
    }

    const renderMoveUp = (i) => (i > 0 ? <a onClick={() => this.onMove(i, -1)}>Up</a> : null)

    const renderMoveDown = (i) => (i < items.length - 1 ? <a onClick={() => this.onMove(i, 1)}>Down</a> : null)

    const handleAddAction = () => this.setState({ showConditionalModalForm: true })

    const renderType = (i) => {
      if (!i.node || i.node === '') {
        return <Label bsStyle="danger">{lang.tr('studio.flow.node.missingLink')}</Label>
      }

      if (i.node === 'END') {
        return <Label bsStyle="warning">{lang.tr('studio.flow.node.end')}</Label>
      }

      if (i.node === '#') {
        return <Label bsStyle="warning">{lang.tr('studio.flow.node.return')}</Label>
      }

      if (i.node.includes('.flow.json')) {
        return <Label bsStyle="primary">{i.node}</Label>
      }

      return <Label bsStyle="default">{i.node}</Label>
    }

    return (
      <Fragment>
        <div>
          {items.map((item, i) => (
            <Fragment key={`${i}.${item.node || '-'}`}>
              <ConditionItem className={style.item} condition={item} position={i}>
                {renderType(item)}
              </ConditionItem>
              {!readOnly && (
                <div className={style.actions}>
                  <a onClick={() => this.onEdit(i)}>{lang.tr('edit')}</a>
                  <a onClick={() => this.onRemove(i)}>{lang.tr('remove')}</a>
                  <a onClick={() => this.onCopyAction(i)}>{lang.tr('copy')}</a>
                  {renderMoveUp(i)}
                  {renderMoveDown(i)}
                </div>
              )}
            </Fragment>
          ))}
          {!readOnly && (
            <div className={style.actions}>
              <Button onClick={handleAddAction} bsSize="xsmall">
                <i className={classnames('material-icons', style.actionIcons)}>add</i>
              </Button>
              <Button onClick={this.props.pasteItem} bsSize="xsmall" disabled={!this.props.canPaste}>
                <i className={classnames('material-icons', style.actionIcons)}>content_paste</i>
              </Button>
            </div>
          )}
        </div>
        {!readOnly && (
          <ConditionModalForm
            currentFlow={this.props.currentFlow}
            currentNodeName={this.props.currentNodeName}
            subflows={this.props.subflows}
            show={this.state.showConditionalModalForm}
            onClose={() => this.setState({ showConditionalModalForm: false, itemToEditIndex: null })}
            onSubmit={this.onSubmit}
            item={items[this.state.itemToEditIndex]}
          />
        )}
      </Fragment>
    )
  }
}
