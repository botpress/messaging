import { H1 } from '@blueprintjs/core'
import React, { Fragment } from 'react'

import { NLU } from '@botpress/sdk'
import { ListEntityEditor } from './ListEntity'
import { PatternEntityEditor } from './PatternEntity'

interface Props {
  entities: NLU.EntityDefinition[]
  entity: NLU.EntityDefinition
  updateEntity: (targetEntity: string, e: NLU.EntityDefinition) => void
}

export const EntityEditor = (props: Props) => {
  const { entity } = props

  return entity ? (
    <Fragment>
      <H1>{entity.name}</H1>
      {entity.type === 'list' && <ListEntityEditor {...props} />}
      {entity.type === 'pattern' && <PatternEntityEditor {...props} />}
    </Fragment>
  ) : null
}
