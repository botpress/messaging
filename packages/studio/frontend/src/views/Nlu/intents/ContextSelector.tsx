import { Colors, Icon, MenuItem, Position, Tooltip } from '@blueprintjs/core'
import { ItemRenderer, MultiSelect } from '@blueprintjs/select'
import React, { FC, useEffect, useState } from 'react'
import { lang } from '~/components/Shared/translations'

import { NluClient } from '../client'

import style from './style.scss'

interface Props {
  contexts: string[]
  api: NluClient
  saveContexts: (ctx: string[]) => void
}

export const ContextSelector: FC<Props> = (props) => {
  const [availableContexts, setContexts] = useState([])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    props.api.fetchContexts().then(setContexts)
  }, [])

  const removeCtx = (_, idx: number) => {
    props.saveContexts([...props.contexts.slice(0, idx), ...props.contexts.slice(idx + 1)])
  }

  const addCtx = (ctx: string) => {
    if (availableContexts.indexOf(ctx) === -1) {
      setContexts([...availableContexts, ctx])
    }
    props.saveContexts([...props.contexts, ctx])
  }

  const onItemSelect = (ctx: string) => {
    const idx = props.contexts.indexOf(ctx)
    if (idx !== -1) {
      removeCtx(ctx, idx)
    } else {
      addCtx(ctx)
    }
  }

  const ctxItemRenderer: ItemRenderer<string> = (ctx, { handleClick, modifiers }) => (
    <MenuItem
      text={ctx}
      key={ctx}
      onClick={handleClick}
      active={modifiers.active}
      icon={props.contexts.indexOf(ctx) !== -1 ? 'tick' : 'blank'}
    />
  )

  const createNewItemRenderer = (query: string, active: boolean, handleClick) => (
    <MenuItem
      icon="plus"
      text={lang.tr('nlu.intents.contextSelectorCreateMissing', { query })}
      active={active}
      onClick={handleClick}
      shouldDismissPopover={false}
    />
  )

  return (
    <div>
      <div>
        <label htmlFor="selectContext">Contexts</label>
        &nbsp;
        <Tooltip content={lang.tr('nlu.intents.contextSelectorTooltip')} position={Position.RIGHT}>
          <Icon color={Colors.GRAY2} icon="info-sign" />
        </Tooltip>
      </div>
      {/* TODO move this pre-configured multi-select in bp ui */}
      <MultiSelect
        className={style.ctxSelect}
        placeholder={lang.tr('nlu.intents.contextSelectorPlaceholder')}
        items={availableContexts}
        itemRenderer={ctxItemRenderer}
        itemPredicate={(q: string, ctx: string) => !q || ctx.includes(q)}
        onItemSelect={onItemSelect}
        tagRenderer={(ctx) => ctx}
        tagInputProps={{ tagProps: { minimal: true }, onRemove: removeCtx }}
        popoverProps={{ minimal: true, fill: true }}
        selectedItems={props.contexts}
        createNewItemRenderer={createNewItemRenderer}
        createNewItemFromQuery={(q) => q}
      />
    </div>
  )
}
