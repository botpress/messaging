import { SuperInput, SiTypes } from '@botpress/inspector-kit'
import { FlowView } from 'common/typings'
import _ from 'lodash'
import React, { Component } from 'react'
import { Button, Radio, FormControl, Alert, Form } from 'react-bootstrap'
import { connect } from 'react-redux'
import Select from 'react-select'
import { Dialog } from '~/components/Shared/Dialog'
import { lang } from '~/components/Shared/translations'
import { getFlowLabel, reorderFlows } from '~/components/Shared/Utils'
import SmartInput from '~/components/SmartInput'
import { RootReducer } from '~/reducers'
import { ROUTER_CONDITON_REGEX } from '../utils/general.util'
import style from './style.scss'

const availableProps: Option[] = [
  { label: 'User Data', value: 'user' },
  { label: 'Current User Session', value: 'session' },
  { label: 'Temporary Dialog Context', value: 'temp' }
]

interface Condition {
  condition: string
  conditionType: 'always' | 'intent' | 'raw' | 'props'
  node: string
  caption: string
}

type TransitionType = 'end' | 'return' | 'subflow' | 'node'

interface Option {
  label: string
  value: string
}

type StateProps = ReturnType<typeof mapStateToProps>

type Props = StateProps & {
  subflows: string[]
  item?: Condition
  currentFlow: FlowView
  currentNodeName: string
  show: boolean
  onClose: () => void
  onSubmit: (payload: {
    caption: string
    condition: string
    conditionType: Condition['conditionType']
    node: ''
  }) => void
}

interface State {
  typeOfTransition: TransitionType
  flowToSubflow?: Option
  flowToSubflowNode?: string
  flowToNode?: Option
  transitionError?: string
  conditionError?: string
  conditionType: Condition['conditionType']
  condition: Condition['condition']
  matchPropsFieldName: string
  matchPropsExpression: string
  isEdit?: boolean
  subflowOptions?: Option[]
  matchIntent?: Option
  returnToNode?: string
  matchPropsType?: Option
}

class ConditionModalForm extends Component<Props, State> {
  state: State = {
    typeOfTransition: 'end',
    conditionType: 'always',
    condition: 'true',
    matchPropsFieldName: '',
    matchPropsExpression: ''
  }

  componentDidMount() {
    const subflowNames = this.props.subflows.filter((flow) => !flow.startsWith('skills/'))

    const subflowOptions = reorderFlows(subflowNames).map((flow: string) => ({
      label: getFlowLabel(flow),
      value: flow
    }))

    this.setState({ subflowOptions })
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props === prevProps) {
      return
    }

    const { item } = this.props
    const condition = item?.condition || ''
    const conditionType = item?.conditionType || this.getConditionType(condition)

    if (item?.node) {
      let typeOfTransition: TransitionType = item.node.indexOf('.') !== -1 ? 'subflow' : 'node'
      typeOfTransition = item.node === 'END' ? 'end' : typeOfTransition
      typeOfTransition = /^#/.test(item.node) ? 'return' : typeOfTransition
      const options = this.nodeOptions()

      const hashIndex = item.node.indexOf('#')

      this.setState({
        typeOfTransition,
        conditionType,
        condition,
        flowToSubflow:
          typeOfTransition === 'subflow'
            ? this.state.subflowOptions.find(
                (x) => x.value === (hashIndex !== -1 ? item.node.substring(0, hashIndex) : item.node)
              )
            : undefined,
        flowToSubflowNode:
          typeOfTransition === 'subflow' && item.node && hashIndex !== -1
            ? item.node.substring(hashIndex + 1)
            : undefined,
        flowToNode: typeOfTransition === 'node' ? options.find((x) => x.value === item.node) : options[0],
        returnToNode: typeOfTransition === 'return' ? item.node.substr(1) : ''
      })
    } else {
      this.resetForm({ condition, conditionType })
    }

    this.setState({ isEdit: Boolean(item) })

    if (conditionType === 'intent') {
      this.extractIntent(condition)
    } else if (conditionType === 'props') {
      this.extractProps(condition)
    }
  }

  nodeOptions(): Option[] {
    const { currentFlow: flow, currentNodeName } = this.props
    const nodes = flow?.nodes || []
    const options = nodes
      .filter(({ name }) => name !== currentNodeName)
      .map(({ name }) => ({ label: name, value: name }))

    return [{ label: lang.tr('studio.flow.node.transition.noSpecific'), value: undefined }, ...options]
  }

  getConditionType(condition: string) {
    condition = condition.trim()

    if (condition === 'true') {
      return 'always'
    } else if (condition.includes('event.nlu.intent.name')) {
      return 'intent'
    } else if (availableProps.some((props) => condition.indexOf(`${props.value}.`) === 0)) {
      return 'props'
    } else {
      return 'raw'
    }
  }

  extractIntent(condition: string) {
    const intent = condition.match(/'(.*)'/)
    if (intent) {
      this.setState({ matchIntent: { value: intent[1], label: intent[1] } })
    }
  }

  extractProps(condition: string) {
    const props = condition.match(ROUTER_CONDITON_REGEX)

    if (props?.length > 3) {
      this.setState({
        matchPropsType: availableProps.find((x) => x.value === props[1]),
        matchPropsFieldName: props[2],
        matchPropsExpression: props[3]
      })
    }
  }

  changeTransitionType(type) {
    this.setState({
      typeOfTransition: type,
      flowToSubflow: this.state.flowToSubflow || this.state.subflowOptions[0],
      flowToNode: this.state.flowToNode || this.nodeOptions()[0],
      transitionError: undefined
    })
  }

  validation() {
    if (this.state.typeOfTransition === 'subflow' && !this.state.flowToSubflow) {
      this.setState({
        transitionError: lang.tr('studio.flow.node.transition.mustSelectSubflow')
      })

      return false
    }

    if (_.isEmpty(this.state.condition)) {
      this.setState({
        conditionError: lang.tr('studio.flow.node.transition.specifyCondition')
      })

      return false
    }

    this.setState({
      conditionError: undefined,
      transitionError: undefined
    })

    return true
  }

  resetForm(state?: Pick<State, 'condition' | 'conditionType'>) {
    this.setState({
      typeOfTransition: 'node',
      flowToSubflow: undefined,
      flowToNode: this.nodeOptions()[0],
      returnToNode: '',
      conditionError: undefined,
      transitionError: undefined,
      condition: '',
      ...state
    })
  }

  onSubmitClick = () => {
    if (!this.validation()) {
      return
    }

    // replace: "{{stuff}} more stuff... {{other stuff}}" by "stuff more stuff... other stuff"
    const condition = this.state.condition.replace(/({{)(.*?)(}})/g, '$2')
    const payload = {
      caption: this.props.item?.caption,
      condition,
      conditionType: this.state.conditionType,
      node: undefined
    }

    if (this.state.typeOfTransition === 'subflow') {
      const node = this.state.flowToSubflowNode
      const subflow = this.state.flowToSubflow?.value || this.state.flowToSubflow

      payload.node = `${subflow}${node?.length ? `#${node.replace(/\s/g, '')}` : ''}`
    } else if (this.state.typeOfTransition === 'end') {
      payload.node = 'END'
    } else if (this.state.typeOfTransition === 'node') {
      let earlierNode = this.state.isEdit && this.props.item?.node

      if (
        earlierNode &&
        (/^END$/i.test(earlierNode) || earlierNode.startsWith('#') || /\.flow\.json$/i.test(earlierNode))
      ) {
        earlierNode = undefined
      }

      payload.node = this.state.flowToNode?.value || earlierNode || ''
    } else if (this.state.typeOfTransition === 'return') {
      payload.node = `#${this.state.returnToNode}`
    } else {
      payload.node = ''
    }

    this.props.onSubmit(payload)
    this.resetForm()
  }

  renderSubflowChoice() {
    const { flowToSubflow, flowToSubflowNode, subflowOptions } = this.state

    const updateSubflowNode = (value: string) =>
      this.setState({
        flowToSubflowNode: value
      })

    return (
      <div className={style.toSubflowSection}>
        <Select
          name="flowToSubflow"
          value={flowToSubflow}
          options={subflowOptions}
          onChange={(flowToSubflow: Option) => this.setState({ flowToSubflow })}
          menuPortalTarget={document.getElementById('menuOverlayPortal')}
        />
        <label>{lang.tr('studio.flow.node.transition.specificNodeCalled')}:</label>
        <input type="text" value={flowToSubflowNode} onChange={(e) => updateSubflowNode(e.target.value)} />
      </div>
    )
  }

  renderReturnToNode() {
    const updateNode = (value: string) =>
      this.setState({
        returnToNode: value
      })

    return (
      <div className={style.returnToNodeSection}>
        <div>{lang.tr('studio.flow.node.transition.returnToNodeCalled')}:</div>
        <input type="text" value={this.state.returnToNode} onChange={(e) => updateNode(e.target.value)} />
        <div>
          <input
            type="checkbox"
            id="rPreviousNode"
            checked={_.isEmpty(this.state.returnToNode)}
            onChange={() => updateNode('')}
          />
          <label htmlFor="rPreviousNode">{lang.tr('studio.flow.node.transition.returnToCallingNode')}</label>
          <br></br>
          <input
            type="checkbox"
            id="executeNode"
            checked={this.state.returnToNode === '#'}
            onChange={() => updateNode('#')}
          />
          <label htmlFor="executeNode">{lang.tr('studio.flow.node.transition.returnToCallingNodeExecute')}</label>
        </div>
      </div>
    )
  }

  renderNodesChoice() {
    if (!this.props.currentFlow) {
      return null
    }

    return (
      <Select
        name="flowToNode"
        value={this.state.flowToNode}
        options={this.nodeOptions()}
        onChange={(flowToNode: Option) => this.setState({ flowToNode })}
        menuPortalTarget={document.getElementById('menuOverlayPortal')}
      />
    )
  }

  changeConditionType = (event) => {
    const conditionType: Condition['conditionType'] = event.target.value

    if (conditionType === 'always') {
      this.setState({ conditionType, condition: 'true' })
    } else if (conditionType === 'intent') {
      this.setState({ conditionType, condition: "event.nlu.intent.name === ''" })
    } else {
      this.setState({ conditionType })
    }
  }

  handlePropsTypeChanged = (option: Option) => this.setState({ matchPropsType: option }, this.updatePropertyMatch)
  handlePropsFieldNameChanged = (e) => this.setState({ matchPropsFieldName: e.target.value }, this.updatePropertyMatch)
  handlePropsExpressionChanged = (value: string) =>
    this.setState({ matchPropsExpression: value }, this.updatePropertyMatch)
  handleConditionChanged = (value: string) => this.setState({ condition: value })

  handleMatchIntentChanged = (option: Option) => {
    this.setState({
      matchIntent: option,
      condition: `event.nlu.intent.name === '${option.value}'`
    })
  }

  updatePropertyMatch() {
    const { matchPropsType, matchPropsFieldName, matchPropsExpression } = this.state

    if (matchPropsType && matchPropsFieldName && matchPropsExpression) {
      this.setState({
        condition: `${matchPropsType.value}.${matchPropsFieldName} ${matchPropsExpression}`
      })
    }
  }

  renderIntentPicker() {
    if (!this.props.intents?.length) {
      return null
    }

    const intents: Option[] = this.props.intents
      .filter((i) => !i.name.startsWith('__qna__'))
      .map(({ name }) => ({ label: name, value: name }))
      .concat([{ label: 'none', value: 'none' }])

    return (
      <Select
        name="matchIntent"
        value={this.state.matchIntent}
        options={intents}
        onChange={this.handleMatchIntentChanged}
        menuPortalTarget={document.getElementById('menuOverlayPortal')}
      />
    )
  }

  renderMatchProperty() {
    return (
      <Form inline>
        <Select
          name="matchPropsType"
          value={this.state.matchPropsType}
          options={availableProps}
          onChange={this.handlePropsTypeChanged}
          menuPortalTarget={document.getElementById('menuOverlayPortal')}
        />

        <FormControl
          type="text"
          placeholder={lang.tr('studio.flow.node.transition.fieldName')}
          value={this.state.matchPropsFieldName}
          onChange={this.handlePropsFieldNameChanged}
          className={style.textFields}
        />

        <SmartInput
          placeholder={lang.tr('studio.flow.node.transition.expression')}
          value={this.state.matchPropsExpression}
          onChange={this.handlePropsExpressionChanged}
          className={style.textFields}
          singleLine={false}
        />
      </Form>
    )
  }

  renderRawExpression() {
    return (
      <SuperInput
        type={SiTypes.EXPRESSION}
        placeholder={lang.tr('studio.flow.node.transition.javascriptExpression')}
        value={this.state.condition}
        onChange={this.handleConditionChanged}
        autoFocus
      />
    )
  }

  renderConditions() {
    return (
      <div className={style.section}>
        {this.state.conditionError && <Alert bsStyle="danger">{this.state.conditionError}</Alert>}
        <Radio checked={this.state.conditionType === 'always'} value="always" onChange={this.changeConditionType}>
          {lang.tr('studio.flow.node.transition.condition.always')}
        </Radio>

        <Radio checked={this.state.conditionType === 'intent'} value="intent" onChange={this.changeConditionType}>
          {lang.tr('studio.flow.node.transition.condition.intentIs')}
        </Radio>
        {this.state.conditionType === 'intent' && this.renderIntentPicker()}

        <Radio checked={this.state.conditionType === 'props'} value="props" onChange={this.changeConditionType}>
          {lang.tr('studio.flow.node.transition.condition.matchesProperty')}
        </Radio>
        {this.state.conditionType === 'props' && this.renderMatchProperty()}

        <Radio checked={this.state.conditionType === 'raw'} value="raw" onChange={this.changeConditionType}>
          {lang.tr('studio.flow.node.transition.condition.rawExpression')}
        </Radio>
        {this.state.conditionType === 'raw' && this.renderRawExpression()}
      </div>
    )
  }

  renderActions() {
    return (
      <div className={style.section}>
        <Radio checked={this.state.typeOfTransition === 'end'} onChange={() => this.changeTransitionType('end')}>
          {lang.tr('studio.flow.node.transition.action.endFlow')} <span className={style.endBloc} />
        </Radio>
        <Radio checked={this.state.typeOfTransition === 'return'} onChange={() => this.changeTransitionType('return')}>
          {lang.tr('studio.flow.node.transition.action.returnToPreviousFlow')} <span className={style.returnBloc} />
        </Radio>
        {this.state.typeOfTransition === 'return' && this.renderReturnToNode()}
        <Radio checked={this.state.typeOfTransition === 'node'} onChange={() => this.changeTransitionType('node')}>
          {lang.tr('studio.flow.node.transition.action.transitionToNode')} <span className={style.nodeBloc} />
        </Radio>
        {this.state.typeOfTransition === 'node' && this.renderNodesChoice()}
        <Radio
          checked={this.state.typeOfTransition === 'subflow'}
          onChange={() => this.changeTransitionType('subflow')}
        >
          {lang.tr('studio.flow.node.transition.action.transitionToSubflow')} <span className={style.subflowBloc} />
        </Radio>
        {this.state.transitionError && <Alert bsStyle="danger">{this.state.transitionError}</Alert>}
        {this.state.typeOfTransition === 'subflow' && this.renderSubflowChoice()}
      </div>
    )
  }

  render() {
    return (
      <Dialog.Wrapper
        title={
          this.state.isEdit ? lang.tr('studio.flow.node.transition.edit') : lang.tr('studio.flow.node.transition.new')
        }
        isOpen={this.props.show}
        onClose={this.props.onClose}
      >
        <Dialog.Body>
          <h5>{lang.tr('studio.flow.node.transition.showCondition')}:</h5>
          {this.renderConditions()}
          <h5>{lang.tr('studio.flow.node.transition.whenMetDo')}:</h5>
          {this.renderActions()}
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={this.props.onClose}>{lang.tr('cancel')}</Button>
          <Button onClick={this.onSubmitClick} bsStyle="primary">
            {this.state.isEdit ? lang.tr('update') : lang.tr('create')}
          </Button>
        </Dialog.Footer>
      </Dialog.Wrapper>
    )
  }
}

const mapStateToProps = (state: RootReducer) => ({
  intents: state.skills.intents
})

export default connect(mapStateToProps, undefined)(ConditionModalForm)
