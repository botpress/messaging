import axios from 'axios'
import _ from 'lodash'
import React from 'react'
import { Alert } from 'react-bootstrap'
import Select from 'react-select'
import { Row, Col, Label, Input } from 'reactstrap'
import BotpressContentPicker from '~/components/Content/Select/Widget'
import { BotpressTooltip } from '~/components/Shared/BotpressTooltip'
import SelectActionDropdown from '~/views/FlowBuilder/nodeProps/SelectActionDropdown'
import style from '../style.scss'

const MAX_RETRIES = 10

export class Slot extends React.Component<any, any> {
  state = {
    selectedActionOption: undefined,
    selectedIntentOption: undefined,
    selectedSlotOption: undefined,
    contentElement: undefined,
    notFoundElement: undefined,
    intents: [],
    actions: [],
    maxRetryAttempts: 3,
    error: undefined,
    turnExpiry: -1
  }

  async componentDidMount() {
    await this.fetchActions()
    await this.fetchIntents().then(() => this.setStateFromProps())
  }

  setStateFromProps = () => {
    const data = this.props.initialData

    if (data) {
      this.validateIntentExists(data.intent)
      this.validateSlotExists(data.intent, data.slotName)

      this.setState({
        selectedSlotOption: { value: data.slotName, label: data.slotName },
        selectedIntentOption: { value: data.intent, label: data.intent },
        selectedActionOption: data.validationAction && { value: data.validationAction, label: data.validationAction },
        contentElement: data.contentElement,
        notFoundElement: data.notFoundElement,
        maxRetryAttempts: Number(data.retryAttempts) || 3,
        turnExpiry: Number(data.turnExpiry) || -1
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.isFormValid() || prevState === this.state) {
      return
    }

    const intent = this.getSelectedIntent()
    const slot = this.getSelectedSlot(intent)

    const data = {
      retryAttempts: this.state.maxRetryAttempts,
      contentElement: this.state.contentElement,
      notFoundElement: this.state.notFoundElement,
      turnExpiry: this.state.turnExpiry,
      validationAction: this.state.selectedActionOption && this.state.selectedActionOption.value,
      intent: intent && intent.name,
      slotName: slot && slot.name,
      entities: slot && slot.entities
    }

    this.props.onDataChanged && this.props.onDataChanged(data)
    this.props.onValidChanged && this.props.onValidChanged(true)
  }

  fetchIntents = () => {
    return axios.get(`${window.STUDIO_API_PATH}/nlu/intents`).then(({ data }) => {
      const intents = data.filter((x) => !x.name.startsWith('__qna'))
      this.setState({ intents })
    })
  }

  fetchActions = async () => {
    await axios.get(`${window.STUDIO_API_PATH}/actions`).then(({ data }) => {
      this.setState({
        actions: data
          .filter((action) => !action.hidden)
          .map((x) => {
            return { label: x.name, value: x.name, metadata: x.metadata }
          })
      })
    })
  }

  getSelectedIntent() {
    const intentName = this.state.selectedIntentOption && this.state.selectedIntentOption.value
    return intentName && this.state.intents.find((x) => x.name === intentName)
  }

  getSelectedSlot(intent) {
    const slotName = this.state.selectedSlotOption && this.state.selectedSlotOption.value
    return intent && intent.slots.find((x) => x.name === slotName)
  }

  isFormValid() {
    return (
      this.state.selectedIntentOption &&
      this.state.selectedSlotOption &&
      this.state.contentElement &&
      this.state.notFoundElement
    )
  }

  validateIntentExists = (intentName) => {
    if (!intentName) {
      return
    }

    const exists = this.state.intents.find((x) => x.name === intentName)
    if (!exists) {
      this.setState({ error: 'Missing intent: This intent does not exist anymore!' })
    }
  }

  validateSlotExists = (intentName, slotName) => {
    if (!intentName || !slotName) {
      return
    }

    const currentIntent = this.state.intents.find((x) => x.name === intentName)
    if (!currentIntent || !currentIntent.slots.find((x) => x.name === slotName)) {
      this.setState({ error: 'Missing slot: This slot does not exits anymore!' })
    }
  }

  handleContentChange = (item) => {
    this.setState({ contentElement: item.id })
  }

  handleSlotChange = (selectedSlotOption) => {
    this.validateSlotExists(this.state.selectedIntentOption.value, selectedSlotOption.value)
    this.setState({ selectedSlotOption })
  }

  handleIntentChange = (selectedIntentOption) => {
    this.validateIntentExists(selectedIntentOption.value)
    this.setState({ selectedIntentOption, selectedSlotOption: undefined })
  }

  handleNotFoundChange = (item) => {
    this.setState({ notFoundElement: item.id })
  }

  handleMaxRetryAttemptsChange = (event) => {
    const value = Number(event.target.value)
    if (value > MAX_RETRIES) {
      this.setState({ error: `Too many retry attempts: Choose a number less than or equal to ${MAX_RETRIES}` })
    } else {
      this.setState({ maxRetryAttempts: value })
    }
  }

  handleTurnExpiryChange = (event) => {
    this.setState({ turnExpiry: Number(event.target.value) })
  }

  handleActionChange = (selectedActionOption) => {
    this.setState({ selectedActionOption })
  }

  getSlotOptionsForIntent(intent) {
    const slots = _.get(intent, 'slots', [])
    return slots.map((slot) => {
      return { value: slot.name, label: slot.name }
    })
  }

  render() {
    const intent = this.getSelectedIntent()
    const intentsOptions = this.state.intents.map((intent) => {
      return { value: intent.name, label: intent.name }
    })
    const slotOptions = this.getSlotOptionsForIntent(intent)

    return (
      <div className={style.modalContent}>
        {this.state.error && <Alert bsStyle="danger">{this.state.error}</Alert>}
        <Row style={{ marginBottom: 10 }}>
          <Col md={5}>
            <Label>Choose an intent</Label>
            <Select
              id="intent"
              name="intent"
              isSearchable
              placeholder="Choose an intent or type to search"
              className={style.intentSelect}
              onChange={this.handleIntentChange}
              value={this.state.selectedIntentOption}
              options={intentsOptions}
            />
          </Col>
          <Col md={4}>
            <Label for="slot">Choose a slot to fill</Label>
            <Select
              id="slot"
              name="slot"
              isSearchable
              placeholder="Choose a slot or type to search"
              className={style.slotSelect}
              onChange={this.handleSlotChange}
              value={this.state.selectedSlotOption}
              options={slotOptions}
            />
          </Col>
          <Col md={3}>
            <Label for="turnExpiry">Expires after X turns</Label>
            &nbsp;
            <BotpressTooltip message="The information stored in the slot will be deleted after this number of turns. Set to -1 to never expire." />
            <Input
              id="turnExpiry"
              name="turnExpiry"
              type="number"
              min={-1}
              value={this.state.turnExpiry}
              onChange={this.handleTurnExpiryChange}
            />
          </Col>
        </Row>
        <Row>
          <Col md={9}>
            <Label for="contentPicker">Bot will ask...</Label>
            &nbsp;
            <BotpressTooltip message="The bot should ask a question specific about the slot to fill. (e.g. What is your email?)" />
            <BotpressContentPicker
              style={{ zIndex: 0 }}
              name="contentPicker"
              id="contentPicker"
              itemId={this.state.contentElement}
              onChange={this.handleContentChange}
              placeholder="Pick content"
            />
          </Col>
        </Row>
        <Row>
          <Col md="9">
            <Label>Message to send when user input is invalid</Label>
            &nbsp;
            <BotpressTooltip message="This message will appear to the user when the information he has given is invalid. (e.g. Your email is invalid)" />
            <BotpressContentPicker
              style={{ zIndex: 0 }}
              id="notFoundElement"
              itemId={this.state.notFoundElement}
              onChange={this.handleNotFoundChange}
              placeholder="Pick content to display when the slot is not found"
            />
          </Col>
          <Col md="3">
            <Label for="retryAttempts">Max retry attempts</Label>
            &nbsp;
            <BotpressTooltip message="This is the maximum number of times the bot will try to extract the slot. When the limit is reached, the bot will execute the 'On not found' transition." />
            <Input
              id="retryAttempts"
              name="retryAttempts"
              type="number"
              min="0"
              max={MAX_RETRIES}
              value={this.state.maxRetryAttempts}
              onChange={this.handleMaxRetryAttemptsChange}
            />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Label for="validationCheck">
              <small>Custom Input Validation (optional)</small>
            </Label>
            &nbsp;
            <BotpressTooltip message="You can add custom validation for your slot with an action. It should assign a boolean value to the temp.valid variable." />
            <SelectActionDropdown
              className={style.actionSelect}
              value={this.state.selectedActionOption}
              options={this.state.actions}
              onChange={this.handleActionChange}
              isClearable={true}
            />
          </Col>
        </Row>
      </div>
    )
  }
}
