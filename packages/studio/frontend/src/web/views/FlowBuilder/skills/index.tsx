import { Button, Intent } from '@blueprintjs/core'
import find from 'lodash/find'
import includes from 'lodash/includes'
import React, { useState, useEffect } from 'react'
import Loader from 'react-loaders'
import { connect } from 'react-redux'
import { cancelNewSkill, insertNewSkill, updateSkill } from '~/actions'
import InjectedModuleView from '~/components/PluginInjectionSite/module'
import { Dialog } from '~/components/Shared/Dialog'
import { lang } from '~/components/Shared/translations'
import { RootReducer } from '~/reducers'
import withLanguage from '../../../components/Util/withLanguage'

import { doGenerateFlow } from './flowGenerator'
import { CallAPI } from './skill-call-api'
import { Choice } from './skill-choice'
import { SendEmail } from './skill-send-email'
import { Slot } from './skill-slot'

const style = require('./style.scss')

const VALID_WINDOW_SIZES = ['normal', 'large', 'small']

class WrappedInjectedModule extends React.Component<any> {
  shouldComponentUpdate(nextProps) {
    return nextProps.moduleProps !== this.props.moduleProps || nextProps.moduleName !== this.props.moduleName
  }

  render() {
    return (
      <InjectedModuleView moduleName={this.props.moduleName} componentName={this.props.componentName} {...this.props} />
    )
  }
}

interface OwnProps {
  contentLang: string
  languages: any
  changeContentLanguage: any
  defaultLanguage: string
}

type StateProps = ReturnType<typeof mapStateToProps>
type DispatchProps = typeof mapDispatchToProps
type Props = DispatchProps & StateProps & OwnProps

const SkillsBuilder = (props: Props) => {
  const [moduleProps, setModuleProps] = useState<any>()
  const [canSubmit, setCanSubmit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [windowSize, setWindowSize] = useState('normal')
  const [data, setData] = useState<any>()

  useEffect(() => {
    setCanSubmit(false)
    setLoading(false)
    setModuleProps(buildModuleProps(props.data))
  }, [props.skillId, props.opened])

  const onWindowResized = (size) => {
    if (!includes(VALID_WINDOW_SIZES, size)) {
      const sizes = VALID_WINDOW_SIZES.join(', ')
      return console.warn(lang.tr('studio.flow.skills.error', { size, sizes }))
    }

    setWindowSize(size)
  }

  const buildModuleProps = (data) => ({
    initialData: data,
    onDataChanged: setData,
    onValidChanged: setCanSubmit,
    resizeBuilderWindow: onWindowResized,
    contentLang: props.contentLang,
    languages: props.languages,
    defaultLanguage: props.defaultLanguage
  })

  const onSubmit = () => {
    setLoading(true)
    setCanSubmit(false)

    return generateFlow().then((generated) => {
      if (props.action === 'edit') {
        props.updateSkill({
          skillId: props.skillId,
          data,
          generatedFlow: generated.flow,
          transitions: generated.transitions,
          editFlowName: props.editFlowName,
          editNodeId: props.editNodeId
        })
      } else {
        props.insertNewSkill({
          skillId: props.skillId,
          data,
          generatedFlow: generated.flow,
          transitions: generated.transitions,
          location: props.location
        })
      }
    })
  }

  const generateFlow = async () => {
    return doGenerateFlow(data, props.skillId)
  }

  const findInstalledSkill = () => {
    const skillId = props.skillId
    if (!skillId) {
      return
    }

    return find(props.installedSkills, (x) => x.id.toLowerCase() === skillId.toLowerCase())
  }

  const renderInternalView = (skillId) => {
    switch (skillId) {
      case 'choice':
        return <Choice {...moduleProps}></Choice>
      case 'CallAPI':
        return <CallAPI {...moduleProps}></CallAPI>
      case 'Slot':
        return <Slot {...moduleProps}></Slot>
      case 'SendEmail':
        return <SendEmail {...moduleProps}></SendEmail>
    }
  }

  const renderLoading = () => {
    if (!loading) {
      return null
    }

    return (
      <div className={style.loadingContainer}>
        <h2>{lang.tr('studio.flow.skills.generatingSkillFlow')}</h2>
        <Loader type="ball-pulse" active={true} />
      </div>
    )
  }

  const onCancel = () => props.cancelNewSkill()

  const skill = findInstalledSkill()
  const modalClassName = style['size-' + windowSize]
  const submitName = props.action === 'new' ? lang.tr('insert') : lang.tr('save')
  const title = props.action === 'new' ? lang.tr('studio.flow.skills.insert') : lang.tr('studio.flow.skills.edit')

  const moduleName = skill?.moduleName
  const isBuiltin = moduleName === 'basic-skills'

  return (
    <Dialog.Wrapper
      title={`${title} | ${lang.tr(skill && skill.name)}`}
      size="lg"
      className={modalClassName}
      isOpen={props.opened}
      onClose={onCancel}
    >
      <Dialog.Body>
        {renderLoading()}
        {!loading && isBuiltin && renderInternalView(skill.id)}
        {!loading && !isBuiltin && (
          <WrappedInjectedModule
            moduleName={skill && skill.moduleName}
            componentName={skill && skill.id}
            onNotFound={<div>{lang.tr('studio.flow.skills.couldNotLoad')}</div>}
            extraProps={moduleProps}
          />
        )}
      </Dialog.Body>
      <Dialog.Footer>
        <Button onClick={onCancel}>{lang.tr('cancel')}</Button>
        <Button onClick={onSubmit} disabled={!canSubmit} intent={Intent.PRIMARY}>
          {submitName}
        </Button>
      </Dialog.Footer>
    </Dialog.Wrapper>
  )
}

const mapStateToProps = (state: RootReducer) => ({
  installedSkills: state.skills.installed,
  ...state.skills.builder
})

const mapDispatchToProps = {
  cancelNewSkill,
  insertNewSkill,
  updateSkill
}

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(withLanguage(SkillsBuilder))
