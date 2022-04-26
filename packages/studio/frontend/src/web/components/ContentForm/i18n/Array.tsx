import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import ArrayField from 'react-jsonschema-form/lib/components/fields/ArrayField'
import I18nManager from './I18nManager'

export default class ArrayMl extends I18nManager {
  state = {
    isOpen: false,
    text: [],
    placeholder: '',
    propertyNames: [],
    requiredFormat: ''
  }

  componentDidMount() {
    const schemaProps = (this.props as any).schema.items.properties
    const propertyNames = Object.keys(schemaProps)

    const requiredFormat = propertyNames.map((p) => schemaProps[p].title).join('|')

    const text =
      this.props.formData && this.props.formData.map((el) => propertyNames.map((p) => el[p]).join('|')).join('\n')

    this.setState({ text, requiredFormat, propertyNames } as any)
  }

  handleTextareaChanged = (event) => this.setState({ text: event.target.value } as any)
  toggle = () => this.setState({ isOpen: !this.state.isOpen } as any)

  extractChoices = () => {
    const choices = (this.state.text as any).split('\n').map((line) => {
      const split = line.split('|')

      return this.state.propertyNames.reduce((result, prop, idx) => {
        result[prop] = split[idx]
        return result
      }, {})
    })

    this.handleOnChange(choices)
    this.toggle()
  }

  renderTextarea() {
    return (
      <React.Fragment>
        This input lets you quickly manage the entries of your content element. Add each element on a different line.
        You will have a chance to review your changes after saving on this modal.
        <br />
        <br />
        Expected format: <strong>{this.state.requiredFormat}</strong>
        <textarea
          style={{ width: '100%', height: '80%', marginTop: 8 }}
          onChange={this.handleTextareaChanged}
          value={this.state.text}
        />
      </React.Fragment>
    )
  }

  renderModal() {
    return (
      <Modal
        container={document.getElementById('app')}
        show={this.state.isOpen}
        onHide={this.toggle}
        backdrop={'static'}
        style={{ zIndex: 9999 }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Quick Editor</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: 500 }}>{this.renderTextarea()}</Modal.Body>
        <Modal.Footer>
          <p>
            <Button onClick={this.extractChoices} bsStyle="primary">
              Save
            </Button>
            &nbsp;
            <Button bsStyle="danger" onClick={this.toggle}>
              Cancel
            </Button>
          </p>
        </Modal.Footer>
      </Modal>
    )
  }

  render() {
    return (
      <div>
        <div style={{ float: 'right', position: 'absolute', right: 30 }}>
          <Button onClick={this.toggle} bsStyle="link">
            Quick Editor
          </Button>
        </div>
        {this.renderWrapped(
          <ArrayField {...this.props} formData={this.props.formData} onChange={this.handleOnChange} />
        )}
        {this.renderModal()}
      </div>
    )
  }
}
