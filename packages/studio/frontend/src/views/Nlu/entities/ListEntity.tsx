import { Button, Colors, FormGroup, Icon, InputGroup, Position, Radio, RadioGroup, Tooltip } from '@blueprintjs/core'
import { NLU } from 'botpress/sdk'
import { getEntityId } from 'common/entity-id'
import _ from 'lodash'
import React, { useEffect, useState, useReducer } from 'react'
import { toast } from '~/components/Shared/Toaster'
import { lang } from '~/components/Shared/translations'
import { inspect } from '~/components/Shared/utilities/inspect'

import { Occurrence } from './ListEntityOccurrence'
import style from './style.scss'

interface Props {
  entities: NLU.EntityDefinition[]
  entity: NLU.EntityDefinition
  updateEntity: (targetEntity: string, entity: NLU.EntityDefinition) => void
}

const FuzzyTolerance = {
  Strict: 1,
  Medium: 0.8,
  Loose: 0.65
}

interface EntityState {
  fuzzy: number
  occurrences: NLU.EntityDefOccurrence[]
}

function EntityContentReducer(state: EntityState, action): EntityState {
  const { type, data } = action
  if (type === 'setStateFromEntity') {
    const entity: NLU.EntityDefinition = data.entity
    return {
      fuzzy: entity.fuzzy,
      occurrences: entity.occurrences
    }
  } else if (type === 'setFuzzy') {
    return { ...state, fuzzy: data.fuzzy }
  } else if (type === 'setOccurrences') {
    return { ...state, occurrences: data.occurrences }
  } else {
    return state
  }
}

export const ListEntityEditor: React.FC<Props> = (props) => {
  const [state, dispatch] = useReducer(EntityContentReducer, {
    fuzzy: props.entity.fuzzy,
    occurrences: props.entity.occurrences
  })
  const [newOccurrence, setNewOccurrence] = useState('')

  useEffect(() => {
    dispatch({ type: 'setStateFromEntity', data: { entity: props.entity } })
    inspect(props.entity)
  }, [props.entity.name])

  useEffect(() => {
    const newEntity = { ...props.entity, ...state }
    if (!_.isEqual(newEntity, props.entity)) {
      props.updateEntity(getEntityId(newEntity.name), newEntity)
    }
  }, [state])

  const isNewOccurrenceEmpty = () => newOccurrence.trim().length === 0

  const isUniqueInEntity = (newElement: string) =>
    !props.entities
      .filter((entity) => entity.type === 'list')
      .filter((entity) => entity.id === props.entity.id)
      .some(({ occurrences }) => occurrences.some(({ name, synonyms }) => [name, ...synonyms].includes(newElement)))

  const addOccurrence = () => {
    if (isNewOccurrenceEmpty()) {
      return
    }
    if (!isUniqueInEntity(newOccurrence)) {
      toast.failure('Occurence duplication within the same entity not allowed')
      return
    }

    dispatch({
      type: 'setOccurrences',
      data: { occurrences: [...state.occurrences, { name: newOccurrence, synonyms: [] }] }
    })
    setNewOccurrence('')
  }

  const editOccurrence = (idx: number, occurrence: NLU.EntityDefOccurrence) => {
    const synonymAdded = () => {
      const oldOccurence = state.occurrences[idx]
      return oldOccurence.synonyms.length < occurrence.synonyms.length
    }
    if (synonymAdded()) {
      const newSynonym = _.last(occurrence.synonyms)
      if (!isUniqueInEntity(newSynonym)) {
        return toast.failure('Synonym duplication within the same entity not allowed')
      }
    }

    const occurrences = [...state.occurrences.slice(0, idx), occurrence, ...state.occurrences.slice(idx + 1)]
    dispatch({
      type: 'setOccurrences',
      data: { occurrences }
    })
  }

  const removeOccurrence = (idx: number) => {
    const occurrences = [...state.occurrences.slice(0, idx), ...state.occurrences.slice(idx + 1)]
    dispatch({
      type: 'setOccurrences',
      data: { occurrences }
    })
  }

  const handleFuzzyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'setFuzzy',
      data: { fuzzy: parseFloat(e.target.value) }
    })
  }

  return (
    <div className={style.entityEditorBody}>
      <div className={style.dataPane}>
        <FormGroup
          label={
            <span>
              <Tooltip
                content={lang.tr('nlu.entities.occurrenceTooltip')}
                position={Position.LEFT}
                popoverClassName={style.configPopover}
              >
                <span>
                  {lang.tr('nlu.entities.newOccurrence')}&nbsp;
                  <Icon icon="help" color={Colors.GRAY3} />
                </span>
              </Tooltip>
            </span>
          }
          labelFor="occurrence"
        >
          <InputGroup
            rightElement={<Button icon="add" minimal onClick={addOccurrence} disabled={isNewOccurrenceEmpty()} />}
            type="text"
            id="occurrence"
            placeholder={lang.tr('nlu.entities.occurrencePlaceholder')}
            value={newOccurrence}
            onKeyDown={(e) => e.keyCode === 13 && addOccurrence()}
            onChange={(e) => setNewOccurrence(e.target.value)}
          />
        </FormGroup>
        {state.occurrences.length > 0 && (
          <FormGroup label={lang.tr('nlu.entities.occurrenceLabel')}>
            <div className={style.occurrencesList}>
              {state.occurrences.map((o, i) => (
                <Occurrence
                  key={o.name}
                  occurrence={o}
                  remove={removeOccurrence.bind(null, i)}
                  onChange={editOccurrence.bind(null, i)}
                />
              ))}
            </div>
          </FormGroup>
        )}
      </div>
      <div className={style.configPane}>
        <FormGroup
          label={
            <Tooltip
              content={lang.tr('nlu.entities.fuzzyTooltip')}
              position={Position.LEFT}
              popoverClassName={style.configPopover}
            >
              <span>
                {lang.tr('nlu.entities.fuzzyLabel')}&nbsp;
                <Icon icon="help" color={Colors.GRAY3} />
              </span>
            </Tooltip>
          }
        />
        <RadioGroup onChange={handleFuzzyChange} selectedValue={state.fuzzy} inline>
          <Radio label={lang.tr('nlu.entities.strict')} value={FuzzyTolerance.Strict} />
          <Radio label={lang.tr('nlu.entities.medium')} value={FuzzyTolerance.Medium} />
          <Radio label={lang.tr('nlu.entities.loose')} value={FuzzyTolerance.Loose} />
        </RadioGroup>
      </div>
    </div>
  )
}
