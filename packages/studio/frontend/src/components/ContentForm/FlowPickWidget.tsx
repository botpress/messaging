import axios from 'axios'
import find from 'lodash/find'
import get from 'lodash/get'
import React, { Component } from 'react'
import { Row, Col } from 'react-bootstrap'
import Select from 'react-select'

export default class FlowPickWidget extends Component<any, any> {
  constructor(props) {
    super(props)

    this.state = {
      flows: null,
      flowNode: props.value,
      redirectFlow: '',
      redirectNode: ''
    }
  }

  componentDidMount() {
    void this.fetchFlows()
    this.extractFlowNode()
  }

  async fetchFlows() {
    return axios.get('/api/flows/all').then(({ data }) => {
      this.setState({ flows: data })
    })
  }

  onSelectChange = (prop) => (option) => {
    this.setState({ [prop]: option }, () => {
      const flow = this.state.redirectFlow && this.state.redirectFlow.value
      const node = this.state.redirectNode && this.state.redirectNode.value
      this.props.onChange(`${flow}#${node}`)
    })
  }

  extractFlowNode = () => {
    if (this.state.flowNode && this.state.flowNode.indexOf('#') > -1) {
      const split = this.state.flowNode.split('#')

      this.setState({
        redirectFlow: split[0],
        redirectNode: split[1]
      })
    }
  }

  render() {
    const { flows } = this.state
    if (!flows) {
      return null
    }

    const { redirectFlow, redirectNode } = this.state

    const flowOptions = flows.map(({ name }) => ({ label: name, value: name }))
    const nodeOptions = !redirectFlow
      ? []
      : get(find(flows, { name: redirectFlow }), 'nodes', []).map(({ name }) => ({ label: name, value: name }))

    return (
      <div>
        <Row>
          <Col sm={6} md={2}>
            Flow:
          </Col>
          <Col sm={6} md={4}>
            <Select
              value={redirectFlow}
              options={flowOptions}
              onChange={this.onSelectChange('redirectFlow')}
              menuPortalTarget={document.getElementById('menuOverlayPortal')}
            />
          </Col>

          <Col sm={6} md={2}>
            Node:
          </Col>
          <Col sm={6} md={4}>
            <Select
              value={redirectNode}
              options={nodeOptions}
              onChange={this.onSelectChange('redirectNode')}
              menuPortalTarget={document.getElementById('menuOverlayPortal')}
            />
          </Col>
        </Row>
      </div>
    )
  }
}
