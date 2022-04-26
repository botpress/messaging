import { Icon } from '@blueprintjs/core'
import { FileType, HOOK_SIGNATURES } from 'common/code-editor'
import _ from 'lodash'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { SearchBar, SidePanel, SidePanelSection } from '~/components/Shared/Interface'
import MainLayout from '~/components/Shared/MainLayout'
import { lang } from '~/components/Shared/translations'

import FileStatus from './components/FileStatus'
import NewFileModal from './components/NewFileModal'
import { UploadModal } from './components/UploadModal'
import FileNavigator from './FileNavigator'
import { RootStore, StoreDef } from './store'
import { EditorStore } from './store/editor'
import { EXAMPLE_FOLDER_LABEL } from './utils/tree'

class PanelContent extends React.Component<Props> {
  private expandedNodes = {}

  state = {
    actionFiles: [],
    hookFiles: [],
    botConfigs: [],
    moduleConfigFiles: [],
    rawFiles: [],
    components: [],
    selectedNode: '',
    selectedFile: undefined,
    isMoveModalOpen: false,
    isCreateModalOpen: false,
    isUploadModalOpen: false,
    isComponent: false,
    fileType: undefined,
    hookType: undefined
  }

  componentDidMount() {
    this.updateFolders()
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.files !== this.props.files) {
      this.updateFolders()
    }
  }

  addFiles(fileType: string, label: string, fileList: any[]) {
    const files = this.props.files[fileType]

    if (files && files.length) {
      const sortedFiles = _.sortBy(files, 'location')
      fileList.push({ label, files: sortedFiles })
    }
  }

  updateFolders() {
    if (!this.props.files) {
      return
    }

    const actionFiles = []
    this.addFiles('bot.actions', lang.tr('code-editor.sidePanel.currentBot'), actionFiles)

    const hookFiles = []
    this.addFiles('bot.hooks', lang.tr('code-editor.sidePanel.currentBot'), hookFiles)

    const botConfigFiles = []
    this.addFiles('bot.bot_config', lang.tr('code-editor.sidePanel.currentBot'), botConfigFiles)

    const moduleConfigFiles = []
    this.addFiles('bot.module_config', lang.tr('code-editor.sidePanel.currentBot'), moduleConfigFiles)

    this.addFiles('hook_example', EXAMPLE_FOLDER_LABEL, hookFiles)
    this.addFiles('action_example', EXAMPLE_FOLDER_LABEL, actionFiles)

    this.setState({
      actionFiles,
      hookFiles,
      botConfigs: botConfigFiles,
      moduleConfigFiles
    })
  }

  updateNodeExpanded = (id: string, isExpanded: boolean) => {
    if (isExpanded) {
      this.expandedNodes[id] = true
    } else {
      delete this.expandedNodes[id]
    }
  }

  updateNodeSelected = (fullyQualifiedId: string) => {
    this.setState({ selectedNode: fullyQualifiedId })
  }

  hasPermission = (perm: string, isWrite?: boolean): boolean => {
    const { permissions } = this.props
    return permissions && permissions[perm] && permissions[perm][isWrite ? 'write' : 'read']
  }

  createFilePrompt(type: FileType, hookType?: string) {
    this.setState({ fileType: type, hookType, isCreateModalOpen: true })
  }

  renderSectionModuleConfig() {
    if (!this.hasPermission('bot.module_config')) {
      return null
    }

    return (
      <SidePanelSection label={lang.tr('code-editor.sidePanel.moduleConf')}>
        <FileNavigator
          id="moduleConfig"
          files={this.state.moduleConfigFiles}
          expandedNodes={this.expandedNodes}
          selectedNode={this.state.selectedNode}
          contextMenuType="moduleConfig"
          onNodeStateExpanded={this.updateNodeExpanded}
          onNodeStateSelected={this.updateNodeSelected}
        />
      </SidePanelSection>
    )
  }

  renderSectionConfig() {
    if (!this.hasPermission('bot.bot_config')) {
      return null
    }

    return (
      <SidePanelSection label={lang.tr('code-editor.sidePanel.conf')}>
        <FileNavigator
          id="config"
          files={this.state.botConfigs}
          disableContextMenu
          expandedNodes={this.expandedNodes}
          selectedNode={this.state.selectedNode}
          onNodeStateExpanded={this.updateNodeExpanded}
          onNodeStateSelected={this.updateNodeSelected}
        />
      </SidePanelSection>
    )
  }

  renderSectionActions() {
    let actions: any = [
      {
        id: 'btn-add-action',
        icon: <Icon icon="add" />,
        key: 'add',
        onClick: () => this.createFilePrompt('action_legacy')
      }
    ]
    if (window.EXPERIMENTAL) {
      actions = [
        {
          id: 'btn-add-action',
          icon: <Icon icon="add" />,
          key: 'add',
          items: [
            { label: 'Action (HTTP)', onClick: () => this.createFilePrompt('action_http') },
            { label: 'Action (Legacy)', onClick: () => this.createFilePrompt('action_legacy') }
          ]
        }
      ]
    }

    return (
      <SidePanelSection label={lang.tr('code-editor.sidePanel.actions')} actions={actions}>
        <FileNavigator
          id="actions"
          files={this.state.actionFiles}
          expandedNodes={this.expandedNodes}
          selectedNode={this.state.selectedNode}
          onNodeStateExpanded={this.updateNodeExpanded}
          onNodeStateSelected={this.updateNodeSelected}
        />
      </SidePanelSection>
    )
  }

  renderSharedLibs() {
    if (!this.hasPermission('bot.shared_libs')) {
      return null
    }

    const actions = [
      {
        id: 'btn-add-action',
        icon: <Icon icon="add" />,
        key: 'add',
        onClick: () => this.createFilePrompt('shared_libs')
      }
    ]
  }

  renderSectionHooks() {
    if (!this.hasPermission('bot.hooks')) {
      return null
    }

    return (
      <SidePanelSection label={lang.tr('code-editor.sidePanel.hooks')} actions={this._buildHooksActions()}>
        <FileNavigator
          id="hooks"
          files={this.state.hookFiles}
          expandedNodes={this.expandedNodes}
          selectedNode={this.state.selectedNode}
          onNodeStateExpanded={this.updateNodeExpanded}
          onNodeStateSelected={this.updateNodeSelected}
        />
      </SidePanelSection>
    )
  }

  _buildHooksActions() {
    const hooks = Object.keys(HOOK_SIGNATURES).map((hookType) => ({
      id: hookType,
      label: hookType
        .split('_')
        .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
        .join(' '),
      onClick: () => this.createFilePrompt('hook', hookType)
    }))

    const items = [
      {
        label: lang.tr('code-editor.sidePanel.eventHooks'),
        items: hooks.filter((x) =>
          [
            'before_incoming_middleware',
            'after_incoming_middleware',
            'before_outgoing_middleware',
            'after_event_processed',
            'before_suggestions_election',
            'before_session_timeout',
            'before_conversation_end'
          ].includes(x.id)
        )
      },
      {
        label: lang.tr('code-editor.sidePanel.botHooks'),
        items: hooks.filter((x) => ['after_bot_mount', 'after_bot_unmount', 'on_bot_error'].includes(x.id))
      }
    ]

    return [
      {
        id: 'btn-add-hook',
        icon: <Icon icon="add" />,
        key: 'add',
        items
      }
    ]
  }

  render() {
    return (
      <SidePanel>
        <React.Fragment>
          <SearchBar
            icon="filter"
            placeholder={lang.tr('code-editor.sidePanel.filterFiles')}
            onChange={this.props.setFilenameFilter}
          />

          {this.renderSectionActions()}
          {this.renderSectionHooks()}
          {this.renderSharedLibs()}
          {this.renderSectionConfig()}
          {this.renderSectionModuleConfig()}
        </React.Fragment>

        <MainLayout.BottomPanel.Register tabName="Code Editor">
          <FileStatus />
        </MainLayout.BottomPanel.Register>

        <NewFileModal
          isOpen={this.state.isCreateModalOpen}
          toggle={() => this.setState({ isCreateModalOpen: !this.state.isCreateModalOpen })}
          openFile={this.props.editor.openFile}
          selectedType={this.state.fileType}
          selectedHookType={this.state.hookType}
          hasPermission={this.hasPermission}
          files={this.props.files}
        />
        <UploadModal
          isOpen={this.state.isUploadModalOpen}
          uploadFile={this.props.store.uploadFile}
          toggle={() => this.setState({ isUploadModalOpen: !this.state.isUploadModalOpen })}
          files={this.props.files}
          isComponent={this.state.isComponent}
        />
      </SidePanel>
    )
  }
}

export default inject(({ store }: { store: RootStore }) => ({
  store,
  editor: store.editor,
  files: store.files,
  setFilenameFilter: store.setFilenameFilter,
  createFilePrompt: store.createFilePrompt,
  permissions: store.permissions
}))(observer(PanelContent))

type Props = { store?: RootStore; editor?: EditorStore; uploadFile?: any } & Pick<
  StoreDef,
  'files' | 'permissions' | 'createFilePrompt' | 'setFilenameFilter'
>
