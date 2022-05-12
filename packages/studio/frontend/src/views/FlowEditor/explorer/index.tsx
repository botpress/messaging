import { Icon } from '@blueprintjs/core'
import reject from 'lodash/reject'
import React, { FC, useState } from 'react'
import { connect } from 'react-redux'
import { deleteFlow, duplicateFlow, renameFlow } from '~/src/actions'
import { history } from '~/src/components/Routes'
import { SearchBar } from '~/src/components/Shared/Interface'
import { lang } from '~/src/components/Shared/translations'
import { getAllFlows, getCurrentFlow, getDirtyFlows, getFlowNamesList } from '~/src/reducers'

import FlowNameModal from './FlowNameModal'
import FlowsList from './FlowsList'
import * as style from './style.module.scss'

export type PanelPermissions = 'create' | 'rename' | 'delete'

interface Props {
  flowsNames: string[]
  onCreateFlow: (flowName: string) => void
  flows: any
  deleteFlow: (flowName: string) => void
  renameFlow: any
  permissions: PanelPermissions[]
  dirtyFlows: any
  duplicateFlow: any
  currentFlow: any
  mutexInfo: string
  readOnly: boolean
  showFlowNodeProps: boolean
  explorerOpen: boolean
}

const SidePanelContent: FC<Props> = ({
  flows,
  readOnly,
  permissions,
  dirtyFlows,
  currentFlow,
  flowsNames,
  onCreateFlow
}) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [flowName, setFlowName] = useState<string>()
  const [flowAction, setFlowAction] = useState<any>('create')
  const [filter, setFilter] = useState<any>()

  const goToFlow = (flow) => history.push(`/flows/${flow.replace(/\.flow\.json$/i, '')}`)

  const normalFlows = reject(flows, (x) => x.name.startsWith('skills/'))
  const flowsName = normalFlows.map((x) => {
    return { name: x.name }
  })

  const createFlowAction = {
    id: 'btn-add-flow',
    icon: <Icon icon="add" />,
    key: 'create',
    tooltip: lang.tr('studio.flow.sidePanel.createNewFlow'),
    onClick: () => {
      setFlowAction('create')
      setModalOpen(true)
    }
  }

  const renameFlow: any = (flowName: string) => {
    setFlowName(flowName)
    setFlowAction('rename')
    setModalOpen(true)
  }

  const duplicateFlow: any = (flowName: string) => {
    setFlowName(flowName)
    setFlowAction('duplicate')
    setModalOpen(true)
  }

  return (
    <div className={style.container}>
      <div className={style.sectionOutset}>
        <h2>{lang.tr('flows')}</h2>
        <SearchBar icon="filter" placeholder={lang.tr('studio.flow.sidePanel.filterFlows')} onChange={setFilter} />
      </div>
      <div className={style.sectionInset}>
        <FlowsList
          readOnly={readOnly}
          canDelete={permissions.includes('delete')}
          canRename={permissions.includes('rename')}
          flows={flowsName}
          dirtyFlows={dirtyFlows}
          goToFlow={goToFlow}
          deleteFlow={deleteFlow}
          duplicateFlow={duplicateFlow}
          renameFlow={renameFlow}
          currentFlow={currentFlow}
          filter={filter}
        />
      </div>

      <FlowNameModal
        action={flowAction}
        originalName={flowName}
        flowsNames={flowsNames}
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        onCreateFlow={onCreateFlow}
        onRenameFlow={renameFlow}
        onDuplicateFlow={duplicateFlow}
      />
    </div>
  )
}

const mapStateToProps = (state) => ({
  currentFlow: getCurrentFlow(state),
  flows: getAllFlows(state),
  dirtyFlows: getDirtyFlows(state as never),
  flowProblems: state.flows.flowProblems,
  flowsName: getFlowNamesList(state as never),
  showFlowNodeProps: state.flows.showFlowNodeProps,
  explorerOpen: state.ui.explorerOpen
})

const mapDispatchToProps = {
  deleteFlow,
  duplicateFlow,
  renameFlow
}

export default connect(mapStateToProps, mapDispatchToProps)(SidePanelContent)
