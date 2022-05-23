import { TagInput, Spinner } from '@blueprintjs/core'
import { debounce } from 'lodash'
import React, { useState, useEffect, useCallback, useMemo, FC } from 'react'
import { connect } from 'react-redux'

import { fetchContentItems } from '~/src/actions'
import { CIcon, contentStyleType } from '~/src/components/contentStyles'
import { lang } from '~/src/components/Shared/translations'
import { useDidMountEffect } from '../../../../../utils/useDidMountEffect'
import { SidePane } from '../../../../layout'
import { AddBtn } from '../../../shared'
import * as style from './style.module.scss'

export interface OwnProps {
  currentItems: any
  fetchContentItems: any
  categories: any
}

const BlockSidePane: FC<OwnProps> = ({ currentItems, fetchContentItems, categories, children }) => {
  const [search, setSearch] = useState('')
  const [contentType, setContentType] = useState(null)
  const [loading, setLoading] = useState(false)

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.count || 0 - b.count || 0).reverse()
  }, [categories])

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

  const selectContentType = useCallback(
    (type) => {
      setContentType(type)
      setLoading(true)
      debouncedSearch(search, type.id)
    },
    [setContentType, setLoading, search, debouncedSearch]
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
                <Spinner className={style.loading} size={50}>
                  loading
                </Spinner>
              ) : (
                currentItems.map((item) => <div className={style.result}>{item.previews.en}</div>)
              )}
            </div>
            <div className={style.createBtn}>
              <p>Create New {lang.tr(contentType.title)}</p>
              <AddBtn />
            </div>
          </>
        ) : (
          <div className={style.contents}>
            <div onClick={() => selectContentType({ title: 'code', id: 'code' })} className={style.content}>
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
              <div>Loading</div>
            )}
          </div>
        )}
      </>
    </SidePane>
  )
}
// return this.props.fetchContentItems({
//   count: SEARCH_RESULTS_LIMIT,
//   searchTerm: this.state.searchTerm,
//   contentType: this.state.contentType || 'all',
//   sortOrder: [{ column: 'createdOn', desc: true }],
//   from: 0
// })

const mapStateToProps = (state) => ({
  currentItems: state.content.currentItems,
  categories: state.content.categories.registered
})

const mapDispatchToProps = {
  fetchContentItems
}

export default connect(mapStateToProps, mapDispatchToProps)(BlockSidePane)
