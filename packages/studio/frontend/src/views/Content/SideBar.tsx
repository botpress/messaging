import { IconName } from '@blueprintjs/core'
import { Categories } from 'common/typings'
import _ from 'lodash'
import React, { Component } from 'react'
import { ItemList, SidePanel, SidePanelSection } from '~/components/Shared/Interface'
import { SectionAction } from '~/components/Shared/Interface/typings'
import { lang } from '~/components/Shared/translations'

export default class SidebarView extends Component<Props> {
  CATEGORY_ALL = {
    id: 'all',
    title: lang.tr('all'),
    count: null
  }

  CATEGORY_UNREGISTERED = {
    id: 'unregistered',
    title: lang.tr('unregistered'),
    count: null
  }

  render() {
    const { registered, unregistered } = this.props.categories

    const contentTypeActions: SectionAction[] = registered.map((cat) => {
      return {
        id: `btn-create-${cat.id}`,
        label: lang.tr(cat.title),
        onClick: (_: React.MouseEvent) => {
          this.props.handleCategorySelected(cat.id)
          this.props.handleAdd()
        }
      }
    })

    const actions: SectionAction[] = contentTypeActions.length
      ? [
          {
            tooltip: lang.tr('studio.content.sideBar.createNewContent'),
            id: 'btn-add-content',
            icon: 'add' as IconName,
            items: contentTypeActions
          }
        ]
      : []

    const contentTypes = [this.CATEGORY_ALL, ...registered].map((cat) => {
      return {
        id: `btn-filter-${cat.id}`,
        label: !!cat.count ? `${lang.tr(cat.title)} (${cat.count})` : lang.tr(cat.title),
        value: cat,
        selected: cat.id === this.props.selectedId,
        actions: [
          cat !== this.CATEGORY_ALL && {
            id: `btn-list-create-${cat.id}`,
            tooltip: lang.tr('studio.content.sideBar.createNew', { name: lang.tr(cat.title) }),
            icon: 'add' as IconName,
            onClick: () => {
              this.props.handleCategorySelected(cat.id)
              this.props.handleAdd()
            }
          }
        ]
      }
    })

    const contentTypesUnregistered = [this.CATEGORY_UNREGISTERED, ...unregistered].map((cat) => {
      return {
        id: `btn-filter-${cat.id}`,
        label: cat.title,
        value: cat,
        selected: cat.id === this.CATEGORY_UNREGISTERED.id,
        actions: [
          cat.id !== this.CATEGORY_UNREGISTERED.id && {
            id: `btn-list-warning-${cat.id}`,
            tooltip: lang.tr('studio.content.sideBar.unregisteredWarning'),
            icon: 'warning-sign' as IconName
          }
        ]
      }
    })

    return (
      <SidePanel>
        <SidePanelSection label={lang.tr('studio.content.sideBar.filterByType')} actions={actions}>
          {registered.length > 0 && (
            <ItemList items={contentTypes} onElementClicked={(el) => this.props.handleCategorySelected(el.value.id)} />
          )}
          {unregistered.length > 0 && <ItemList items={contentTypesUnregistered} />}
        </SidePanelSection>
      </SidePanel>
    )
  }
}

interface Props {
  categories: Categories
  handleCategorySelected: (id: string) => void
  selectedId: string
  readOnly: boolean
  handleAdd: any
}
