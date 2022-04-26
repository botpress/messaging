import { FlowView } from 'common/typings'
import _ from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import {
  clearErrorSaveFlows,
  closeFlowNodeProps,
  flowEditorRedo,
  flowEditorUndo,
  refreshActions,
  refreshIntents,
  setDiagramAction,
  switchFlow
} from '~/actions'
import { Container } from '~/components/Shared/Interface'
import { lang } from '~/components/Shared/translations'
import { isInputFocused } from '~/components/Shared/utilities/inputs'
import { inspect } from '~/components/Shared/utilities/inspect'
import { Timeout, toastFailure, toastInfo } from '~/components/Shared/Utils'
import { isOperationAllowed } from '~/components/Shared/Utils/AccessControl'
import { RootReducer } from '~/reducers'

import Diagram from './diagram'
import SidePanel, { PanelPermissions, SidePanelInspector } from './sidePanelFlows'
import SkillsBuilder from './skills'
import style from './style.scss'

interface OwnProps {
  currentMutex: any
}

type StateProps = ReturnType<typeof mapStateToProps>
type DispatchProps = typeof mapDispatchToProps
type Props = DispatchProps & StateProps & OwnProps & RouteComponentProps

const allActions: PanelPermissions[] = ['create', 'rename', 'delete']
const searchTag = '#search:'

const FlowBuilder = (props: Props) => {
  const { flow } = props.match.params as any

  const diagram: any = useRef(null)
  const [showSearch, setShowSearch] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [mutex, setMutex] = useState<any>()
  const [actions, setActions] = useState(allActions)
  const [highlightFilter, setHighlightFilter] = useState<string>()

  useEffect(() => {
    props.refreshActions()
    props.refreshIntents()

    if (!isOperationAllowed({ operation: 'write', resource: 'bot.flows' })) {
      setReadOnly(true)
      setActions([])
    }

    const { hash } = props.location
    setHighlightFilter(hash.startsWith(searchTag) ? hash.replace(searchTag, '') : '')
  }, [])

  useEffect(() => {
    props.currentFlow && pushFlowState(props.currentFlow)
    inspect(props.flowsByName[props.currentFlow])
  }, [props.currentFlow])

  useEffect(() => {
    const nextRouteFlow = `${flow}.flow.json`
    if (flow && props.currentFlow !== nextRouteFlow) {
      props.switchFlow(nextRouteFlow)
    }
  }, [flow])

  useEffect(() => {
    if (props.errorSavingFlows) {
      const { status } = props.errorSavingFlows
      const message = status === 403 ? lang.tr('studio.unauthUpdate') : lang.tr('studio.flow.errorWhileSaving')
      toastFailure(message, Timeout.LONG, props.clearErrorSaveFlows, { delayed: true })
    }
  }, [props.errorSavingFlows])

  useEffect(() => {
    const me = props.user.email

    const currentFlow = props.flowsByName[props.currentFlow]
    const { currentMutex } = (currentFlow || {}) as FlowView

    if (currentMutex?.remainingSeconds && currentMutex.lastModifiedBy !== me) {
      setReadOnly(true)
      setActions(['create'])
      setMutex({ currentMutex })
      return
    }

    const someoneElseIsEditingOtherFlow = _.values(props.flowsByName).some(
      (f) => f.currentMutex?.remainingSeconds && f.currentMutex.lastModifiedBy !== me
    )

    if (isOperationAllowed({ operation: 'write', resource: 'bot.flows' })) {
      setReadOnly(false)
      setMutex(undefined)
    }

    if (someoneElseIsEditingOtherFlow) {
      setActions(['create'])
      setMutex({ someoneElseIsEditingOtherFlow: true })
    } else {
      setActions(allActions)
    }
  }, [props.flowsByName, props.currentFlow])

  const pushFlowState = (flow) => props.history.push(`/flows/${flow.replace(/\.flow\.json/i, '')}`)

  const keyHandlers = {
    add: (e) => {
      e.preventDefault()
      props.setDiagramAction('insert_node')
    },
    undo: (e) => {
      e.preventDefault()
      props.flowEditorUndo()
    },
    redo: (e) => {
      e.preventDefault()
      props.flowEditorRedo()
    },
    find: (e) => {
      e.preventDefault()
      setShowSearch(!showSearch)
    },
    save: (e) => {
      e.preventDefault()
      toastInfo(lang.tr('studio.flow.nowSaveAuto'), Timeout.LONG)
    },
    delete: (e) => {
      if (!isInputFocused()) {
        e.preventDefault()
        diagram?.deleteSelectedElements()
      }
    },
    cancel: (e) => {
      e.preventDefault()
      props.closeFlowNodeProps()
      setShowSearch(false)
    }
  }

  const handleFilterChanged = ({ target: { value: highlightFilter } }) => {
    const newUrl = props.location.pathname + searchTag + highlightFilter
    setHighlightFilter(highlightFilter)
    props.history.replace(newUrl)
  }

  const createFlow = (name) => {
    diagram.createFlow(name)
    props.switchFlow(`${name}.flow.json`)
  }

  return (
    <Container keyHandlers={keyHandlers}>
      <SidePanel
        onDeleteSelectedElements={() => diagram?.deleteSelectedElements()}
        readOnly={readOnly}
        mutexInfo={mutex}
        permissions={actions}
        onCreateFlow={createFlow}
      />

      <div className={style.container}>
        <div className={style.diagram}>
          <Diagram
            readOnly={readOnly}
            showSearch={showSearch}
            hideSearch={() => setShowSearch(false)}
            handleFilterChanged={handleFilterChanged}
            highlightFilter={highlightFilter}
            mutexInfo={mutex}
            ref={(el) => {
              if (!!el) {
                // @ts-ignore
                diagram = el.getWrappedInstance()
              }
            }}
          />
        </div>
        <SidePanelInspector />
      </div>

      <SkillsBuilder />
    </Container>
  )
}

const mapStateToProps = (state: RootReducer) => ({
  currentFlow: state.flows.currentFlow,
  flowsByName: state.flows.flowsByName,
  showFlowNodeProps: state.flows.showFlowNodeProps,
  user: state.user,
  errorSavingFlows: state.flows.errorSavingFlows
})

const mapDispatchToProps = {
  switchFlow,
  setDiagramAction,
  flowEditorUndo,
  flowEditorRedo,
  clearErrorSaveFlows,
  closeFlowNodeProps,
  refreshActions,
  refreshIntents
}

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(FlowBuilder))
