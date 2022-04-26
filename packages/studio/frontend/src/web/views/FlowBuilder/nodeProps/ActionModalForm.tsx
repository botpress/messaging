import { ContentElement } from 'botpress/sdk'
import { ActionParameterDefinition, LocalActionDefinition } from 'common/typings'
import _ from 'lodash'
import React, { Component } from 'react'
import { Button, OverlayTrigger, Radio, Tooltip } from 'react-bootstrap'
import Markdown from 'react-markdown'
import { connect } from 'react-redux'
import ContentPickerWidget from '~/components/Content/Select/Widget'
import confirmDialog from '~/components/Shared/ConfirmDialog'
import { Dialog } from '~/components/Shared/Dialog'
import { lang } from '~/components/Shared/translations'
import { LinkDocumentationProvider } from '~/components/Util/DocumentationProvider'
import { RootReducer } from '~/reducers'

import ParametersTable, { Parameter } from './ParametersTable'
import SelectActionDropdown from './SelectActionDropdown'
import style from './style.scss'

interface Action {
  label: string
  value: string
  metadata: LocalActionDefinition
}
interface Item {
  type: ActionType
  functionName?: string
  message?: string
  parameters: Parameter
}

interface OwnProps {
  show: boolean
  layoutv2?: boolean
  onSubmit: (item: Item) => void
  onClose: () => void
  item?: Item
}

type StateProps = ReturnType<typeof mapStateToProps>
type Props = StateProps & OwnProps

type ActionType = 'code' | 'message'

interface State {
  actionType: ActionType
  avActions: Action[]
  actionMetadata?: LocalActionDefinition
  functionInputValue?: Action
  isEdit: boolean
  messageValue: string
  functionParams: Parameter
  paramsDef: ActionParameterDefinition[]
}

class ActionModalForm extends Component<Props, State> {
  state: State = {
    actionType: 'message',
    avActions: [],
    messageValue: '',
    functionParams: {},
    isEdit: false,
    paramsDef: []
  }

  textToItemId = (text: string) => _.get(text.match(/^say #!(.*)$/), '[1]')

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const { item } = nextProps

    if (this.props.show || !nextProps.show) {
      return
    }

    if (item) {
      this.setState({
        actionType: nextProps.item.type,
        functionInputValue:
          this.state.avActions && this.state.avActions.find((x) => x.value === nextProps.item.functionName),
        messageValue: nextProps.item.message,
        functionParams: nextProps.item.parameters
      })
    } else {
      this.resetForm()
    }
    this.setState({ isEdit: Boolean(item) })
  }

  componentDidMount() {
    if (this.props.layoutv2) {
      this.setState({ actionType: 'code' })
    }

    this.prepareActions()
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.actions !== this.props.actions) {
      this.prepareActions()
    }
  }

  prepareActions() {
    this.setState({
      avActions: (this.props.actions || []).filter(this.isCloudSafeAction).map((x) => {
        return {
          label: x.name,
          value: x.name,
          metadata: { ...x }
        }
      })
    })
  }

  // Only allow builtin actions and internal actions on cloud-enabled bots
  isCloudSafeAction = (action: LocalActionDefinition) => {
    // TODO: remove this
    return !this.props.isCloudBot || action.name.indexOf('builtin') === 0 || action.name.indexOf('/') === -1
  }

  onChangeType = (type: ActionType) => () => {
    this.setState({ actionType: type })
  }

  resetForm() {
    this.setState({
      actionType: 'message',
      functionInputValue: undefined,
      messageValue: '',
      functionParams: {},
      paramsDef: [],
      actionMetadata: undefined
    })
  }

  renderSectionAction() {
    const { avActions } = this.state

    const paramsHelp = <LinkDocumentationProvider file="main/memory" />

    const onArgsChange = (args: any) => {
      args = _.values(args).reduce((sum, n) => {
        if (n.key === '') {
          return sum
        }
        return { ...sum, [n.key]: n.value }
      }, {})
      this.setState({ functionParams: args })
    }

    return (
      <div>
        <h5>{lang.tr('studio.flow.node.actionToRun')}</h5>
        <div className={style.section}>
          <SelectActionDropdown
            id="select-action"
            value={this.state.functionInputValue || ''}
            options={avActions}
            onChange={(val) => {
              const fn = avActions.find((fn) => fn.value === (val && val.value))
              const paramsDefinition = (_.get(fn, 'metadata.params') || []) as ActionParameterDefinition[]
              this.setState({
                functionInputValue: val,
                paramsDef: paramsDefinition,
                actionMetadata: fn.metadata || undefined
              })

              // TODO Detect if default or custom arguments
              if (
                Object.keys(this.state.functionParams || {}).length > 0 &&
                !confirmDialog(lang.tr('studio.flow.node.confirmOverwriteParameters'), {
                  acceptLabel: lang.tr('overwrite')
                })
              ) {
                return
              }

              this.setState({
                functionParams: _.fromPairs(paramsDefinition.map((param) => [param.name, param.default || '']))
              })
            }}
          />
          {this.state.actionMetadata?.title && <h4>{this.state.actionMetadata.title}</h4>}
          {this.state.actionMetadata?.description && <Markdown source={this.state.actionMetadata.description} />}
        </div>
        <h5>
          {lang.tr('studio.flow.node.actionParameters')} {paramsHelp}
        </h5>
        <div className={style.section}>
          <ParametersTable
            onChange={onArgsChange}
            value={this.state.functionParams}
            definitions={this.state.paramsDef}
          />
        </div>
      </div>
    )
  }

  renderSectionMessage() {
    const handleChange = (item: ContentElement) => {
      this.setState({ messageValue: `say #!${item.id}` })
    }

    const itemId = this.textToItemId(this.state.messageValue)

    return (
      <div>
        <h5>{lang.tr('studio.flow.node.message')}:</h5>
        <div className={style.section}>
          <ContentPickerWidget
            itemId={itemId}
            onChange={handleChange}
            placeholder={lang.tr('studio.flow.node.messageToSend')}
          />
        </div>
      </div>
    )
  }

  onSubmit = () => {
    this.resetForm()
    this.props.onSubmit?.({
      type: this.state.actionType,
      functionName: this.state.functionInputValue?.value,
      message: this.state.messageValue,
      parameters: this.state.functionParams
    })
  }

  onClose = () => {
    this.resetForm()
    this.props.onClose?.()
  }

  isValid = () => {
    switch (this.state.actionType) {
      case 'code':
        return this.state.functionInputValue?.value.length
      case 'message':
        return this.state.messageValue.length
      default:
        return false
    }
  }

  handleAltEnter = (event: React.KeyboardEvent) => {
    if (event.altKey && event.key === 'Enter' && this.isValid()) {
      this.onSubmit()
    }
  }

  render() {
    const formId = 'action-modal-form'

    return (
      <div onKeyDown={this.handleAltEnter}>
        <Dialog.Wrapper
          size="md"
          title={this.state.isEdit ? lang.tr('studio.flow.node.editAction') : lang.tr('studio.flow.node.addAction')}
          isOpen={this.props.show}
          onClose={this.onClose}
          onSubmit={this.onSubmit}
          id={formId}
        >
          <Dialog.Body>
            {!this.props.layoutv2 ? (
              <div>
                <h5>{lang.tr('studio.flow.node.theBotWill')}:</h5>
                <div className={style.section}>
                  <Radio checked={this.state.actionType === 'message'} onChange={this.onChangeType('message')}>
                    {lang.tr('studio.flow.node.saySomething')}
                  </Radio>
                  <Radio checked={this.state.actionType === 'code'} onChange={this.onChangeType('code')}>
                    {lang.tr('studio.flow.node.executeCode')} <LinkDocumentationProvider file="main/code" />
                  </Radio>
                </div>
                {this.state.actionType === 'message' ? this.renderSectionMessage() : this.renderSectionAction()}
              </div>
            ) : (
              this.renderSectionAction()
            )}
          </Dialog.Body>
          <Dialog.Footer>
            <Button id="btn-cancel-action" onClick={this.onClose} form={formId}>
              {lang.tr('cancel')}
            </Button>
            <Button id="btn-submit-action" type="submit" bsStyle="primary" form={formId} disabled={!this.isValid()}>
              {this.state.isEdit
                ? lang.tr('studio.flow.node.finishUpdateAction')
                : lang.tr('studio.flow.node.finishAddAction')}{' '}
              (Alt+Enter)
            </Button>
          </Dialog.Footer>
        </Dialog.Wrapper>
      </div>
    )
  }
}

const mapStateToProps = (state: RootReducer) => ({
  actions: state.skills.actions?.filter((a) => a.legacy),
  isCloudBot: Boolean(state.bot.bot.isCloudBot)
})

export default connect(mapStateToProps, undefined)(ActionModalForm)
