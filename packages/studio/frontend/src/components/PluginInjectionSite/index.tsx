import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import InjectedModuleView from '~/components/PluginInjectionSite/module'
import { moduleViewNames } from '~/util/Modules'

interface Props {
  site: string
  modules: any
}

class InjectionSite extends React.Component<Props> {
  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  renderNotFound = () => {
    return <div /> // TODO Render something meaningful
  }

  render() {
    const { site: injectionSite, modules } = this.props
    const plugins = moduleViewNames(modules, injectionSite)

    return (
      <div className="bp-plugins bp-injection-site">
        {plugins.map(({ moduleName, componentName }, i) => (
          <InjectedModuleView
            key={i}
            moduleName={moduleName}
            componentName={componentName}
            onNotFound={this.renderNotFound}
          />
        ))}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({ modules: state.modules })

export default connect(mapStateToProps)(InjectionSite)
