import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class InjectedComponent extends Component<any> {
  static propTypes = {
    component: PropTypes.func.isRequired
  }

  state = { error: null }

  componentDidCatch(error, info) {
    console.error(error, info)
    this.setState({ error })
  }

  render() {
    const { component: Component, ...props } = this.props
    if (!this.state.error) {
      return <Component {...props} />
    }

    return (
      <div className="panel panel-danger">
        <div className="panel-heading">Could not display component</div>
        <div className="panel-body">
          <h4>An error occurred while loading the component</h4>
          <p>{this.state.error.message}</p>
        </div>
        {/* TODO Put documentation / help here */}
        <div className="panel-footer">
          Developer? <a href="https://botpress.com/docs">click here</a> to see why this might happen
        </div>
      </div>
    )
  }
}
