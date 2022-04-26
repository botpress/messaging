import { NLU } from 'botpress/sdk'
import React, { FC, useState } from 'react'
import confirmDialog from '~/components/Shared/ConfirmDialog'
import { ItemList, SearchBar } from '~/components/Shared/Interface'
import { lang } from '~/components/Shared/translations'

import { NluItem } from '..'
import { NluClient } from '../client'

import { EntityModalAction, EntityNameModal } from './EntityNameModal'

interface Props {
  api: NluClient
  entities: NLU.EntityDefinition[]
  currentItem: NluItem
  setCurrentItem: (x: NluItem) => void
  reloadEntities: () => void
  reloadIntents: () => void
}

export const EntitySidePanelSection: FC<Props> = (props) => {
  const [entitiesFilter, setEntitiesFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [entity, setEntity] = useState<NLU.EntityDefinition>()
  const [entityAction, setEntityAction] = useState<EntityModalAction>('create')

  const renameEntity = (entity: NLU.EntityDefinition) => {
    setEntity(entity)
    setEntityAction('rename')
    setModalOpen(true)
  }

  const duplicateEntity = (entity: NLU.EntityDefinition) => {
    setEntity(entity)
    setEntityAction('duplicate')
    setModalOpen(true)
  }

  const deleteEntity = async (entity: NLU.EntityDefinition) => {
    if (
      await confirmDialog(lang.tr('nlu.entities.deleteMessage', { entityName: entity.name }), {
        acceptLabel: lang.tr('delete')
      })
    ) {
      if (props.currentItem && props.currentItem.name === entity.name) {
        props.setCurrentItem(undefined)
      }

      await props.api.deleteEntity(entity.name)
      await props.reloadEntities()
      await props.reloadIntents()
    }
  }

  const customEntities = props.entities.filter((e) => e.type !== 'system')
  const entityItems = customEntities
    .filter((entity) => !entitiesFilter || entity.name.includes(entitiesFilter))
    .map((entity) => ({
      key: entity.name,
      label: entity.name,
      value: entity.name,
      selected: props.currentItem && props.currentItem.name === entity.name,
      contextMenu: [
        { label: lang.tr('rename'), icon: 'edit', onClick: () => renameEntity(entity) },
        {
          label: lang.tr('duplicate'),
          icon: 'duplicate',
          onClick: () => duplicateEntity(entity)
        },
        { label: lang.tr('delete'), icon: 'delete', onClick: () => deleteEntity(entity) }
      ]
    }))

  const onEntityModified = (entity: NLU.EntityDefinition) => {
    props.setCurrentItem({ type: 'entity', name: entity.name })
    props.reloadEntities()
  }

  return (
    <div>
      {props.entities.length > 1 && (
        <SearchBar
          id="entities-filter"
          icon="filter"
          placeholder={lang.tr('nlu.entities.filterPlaceholder')}
          onChange={setEntitiesFilter}
          showButton={false}
        />
      )}
      <ItemList
        items={entityItems as any}
        onElementClicked={({ value: name }) => props.setCurrentItem({ type: 'entity', name })}
      />
      <EntityNameModal
        action={entityAction}
        originalEntity={entity}
        entityIDs={props.entities.map((e) => e.id)}
        api={props.api}
        onEntityModified={onEntityModified}
        isOpen={modalOpen}
        closeModal={() => setModalOpen(false)}
      />
    </div>
  )
}
