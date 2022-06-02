import { TagInput, Spinner } from '@blueprintjs/core'
import { Classes } from '@blueprintjs/popover2'
import cx from 'classnames'
import { useField } from 'formik'
import produce from 'immer'
import { debounce } from 'lodash'
import React, { useState, useEffect, useCallback, useMemo, FC } from 'react'
import { connect } from 'react-redux'

import { fetchContentItems, updateFlowNode, refreshFlowsLinks } from '~/src/actions'
import { CIcon, contentStyleType } from '~/src/components/contentStyles'
import { lang } from '~/src/components/Shared/translations'
import { useDidMountEffect } from '../../../../../utils/useDidMountEffect'
import { SidePane } from '../../../../layout'
import { AddBtn } from '../../../shared'
import * as style from './style.module.scss'

// @LEGACY
export interface OwnProps {
  name: string
  currentItems: any
  fetchContentItems: any
  categories: any
  updateFlowNode: any
  refreshFlowsLinks: any
}

// @LEGACY
const BlockSidePane: FC<OwnProps> = ({
  name,
  currentItems,
  fetchContentItems,
  updateFlowNode,
  refreshFlowsLinks,
  categories,
  children
}) => {
  const [field, { value }, { setValue }] = useField(name)
  const [search, setSearch] = useState('')
  const [contentType, setContentType] = useState(null)
  const [loading, setLoading] = useState(false)

  // @LEGACY
  const sortedCategories = useMemo(() => {
    return [...(categories || [])].sort((a, b) => a.count || 0 - b.count || 0).reverse()
  }, [categories])

  // @LEGACY
  const debouncedSearch = debounce(
    (search, type) =>
      fetchContentItems({
        count: 20,
        searchTerm: search,
        contentType: type || 'all',
        sortOrder: [{ column: 'createdOn', desc: true }],
        from: 0
      }),
    800
  )

  // @TODO: Create new content
  const createContentType = useCallback((type) => {}, [])

  const selectContentType = useCallback(
    (type) => {
      setContentType(type)
      setLoading(true)
      debouncedSearch(search, type.id)
    },
    [setContentType, setLoading, search, debouncedSearch]
  )

  const addBlock = useCallback(
    (block) => {
      if (!value.find((blockStr) => blockStr.includes(block.id))) {
        setValue(
          produce(value, (draft: any[]) => {
            // @LEGACY
            if (block.contentType.startsWith('builtin') || block.contentType.startsWith('dropdown')) {
              draft.push(`say #!${block.id}`)
            }
          })
        )
      }
    },
    [value, setValue]
  )

  const resetContentType = useCallback(() => {
    setSearch('')
    setContentType(null)
  }, [setContentType, setSearch])

  useDidMountEffect(() => {
    if (!loading) {
      setLoading(true)
    }
    if (contentType) {
      debouncedSearch(search, contentType.id)
    }
  }, [search, contentType])

  useEffect(() => {
    setLoading(false)
  }, [currentItems])

  return (
    <SidePane label="Block Library" target={children} onClose={resetContentType}>
      <>
        {/* @TRANSLATE */}
        <p>Select type to search or create.</p>
        <TagInput
          values={[contentType && lang.tr(contentType.title)]}
          onRemove={resetContentType}
          tagProps={{
            className: style[contentStyleType[contentType?.id]]
          }}
          className={style.search}
          disabled={!contentType}
          inputValue={search}
          leftIcon="search"
          onAdd={() => false}
          onInputChange={(e: any) => setSearch(e.target.value)}
        />
        {contentType ? (
          <>
            <div className={style.results}>
              {loading ? (
                // @TRANSLATE
                <Spinner className={style.loading} size={25}>
                  loading
                </Spinner>
              ) : currentItems.length ? (
                currentItems.map((block) => (
                  <div
                    key={block.id}
                    className={cx(style.result, Classes.POPOVER2_DISMISS)}
                    onClick={() => addBlock(block)}
                  >
                    {block.previews[lang.getLocale()]}
                  </div>
                ))
              ) : (
                // @TRANSLATE
                <span className={style.empty}>No Content</span>
              )}
            </div>
            {/* @TODO: add logic for new content creation */}
            <div className={cx(style.createBtn, Classes.POPOVER2_DISMISS)} onClick={() => console.log(contentType)}>
              {/* @TRANSLATE */}
              <p>Create New {lang.tr(contentType.title)}</p>
              <AddBtn />
            </div>
          </>
        ) : (
          <div className={style.contents}>
            {/* @TODO: fix when codetype problem is fixed */}
            <div onClick={() => selectContentType({ title: 'code', id: 'code' })} className={style.content}>
              {/* @TRANSLATE */}
              <h4>Run Action</h4>
              <CIcon type="code" size={16} />
            </div>
            {sortedCategories ? (
              sortedCategories.map((c) => (
                <div key={c.id} onClick={() => selectContentType(c)} className={style.content}>
                  <h4>{lang.tr(c.title)}</h4>
                  <CIcon type={c.id} size={16} />
                </div>
              ))
            ) : (
              // @TRANSLATE
              <div>Loading</div>
            )}
          </div>
        )}
      </>
    </SidePane>
  )
}

// @LEGACY
const mapStateToProps = (state) => ({
  currentItems: state.content.currentItems,
  categories: state.content.categories.registered
})

const mapDispatchToProps = {
  fetchContentItems,
  updateFlowNode,
  refreshFlowsLinks
}

export default connect(mapStateToProps, mapDispatchToProps)(BlockSidePane)
