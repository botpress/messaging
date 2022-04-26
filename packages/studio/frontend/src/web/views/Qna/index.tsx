import { Spinner } from '@blueprintjs/core'
import axios from 'axios'
import cx from 'classnames'
import { debounce } from 'lodash'
import React, { FC, useCallback, useEffect, useReducer, useRef, useState } from 'react'
import EmptyState from '~/components/Shared/EmptyState'
import MainLayout from '~/components/Shared/MainLayout'
import { lang } from '~/components/Shared/translations'
import { reorderFlows } from '~/components/Shared/Utils'
import withLanguage from '~/components/Util/withLanguage'

import ContextSelector from './Components/ContextSelector'
import { Downloader } from './Components/Downloader'
import { ImportModal } from './Components/ImportModal'
import QnA from './Components/QnA'
import EmptyStateIcon from './Icons/EmptyStateIcon'
import style from './style.scss'
import { dispatchMiddleware, fetchReducer, itemHasError, ITEMS_PER_PAGE, Props } from './utils/qnaList.utils'

const QnAList: FC<Props> = (props) => {
  const [flows, setFlows] = useState([])
  const [filterContexts, setFilterContexts] = useState([])
  const [questionSearch, setQuestionSearch] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [currentTab, setCurrentTab] = useState('qna')
  const [currentLang, setCurrentLang] = useState(props.contentLang)
  const [url, setUrl] = useState('')
  const debounceDispatchMiddleware = useCallback(debounce(dispatchMiddleware, 300), [])
  const wrapperRef = useRef<HTMLDivElement>()
  const [state, dispatch] = useReducer(fetchReducer, {
    count: 0,
    items: [],
    highlighted: undefined,
    loading: true,
    firstUpdate: true,
    page: 1,
    fetchMore: false,
    expandedItems: {}
  })
  const { items, loading, firstUpdate, page, fetchMore, count, expandedItems, highlighted } = state
  const { bp, languages, defaultLanguage, isLite } = props
  const queryParams = new URLSearchParams(window.location.search)

  useEffect(() => {
    wrapperRef.current.addEventListener('scroll', handleScroll)

    fetchData()
      .then(() => {})
      .catch(() => {})

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchFlows()

    return () => {
      wrapperRef.current.removeEventListener('scroll', handleScroll)
      dispatch({ type: 'resetData' })
      setFilterContexts([])
      setQuestionSearch('')
    }
  }, [])

  useEffect(() => {
    if (queryParams.get('id')) {
      fetchHighlightedQna(queryParams.get('id'))
        .then(() => {})
        .catch(() => {})
    } else {
      dispatch({ type: 'resetHighlighted' })
    }
  }, [queryParams.get('id')])

  useEffect(() => {
    if (!firstUpdate) {
      fetchData()
        .then(() => {})
        .catch(() => {})
    }
  }, [filterContexts])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!firstUpdate) {
        fetchData()
          .then(() => {})
          .catch(() => {})
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [questionSearch])

  useEffect(() => {
    if (!loading && fetchMore && items.length < count) {
      fetchData(page + 1)
        .then(() => {})
        .catch(() => {})
    }
  }, [fetchMore])

  const fetchFlows = async () => {
    await axios.get('/flows', { baseURL: window.STUDIO_API_PATH }).then(({ data }) => {
      setFlows(reorderFlows(data.filter((flow) => !flow.name.startsWith('skills/'))))
    })
  }

  const startDownload = () => {
    setUrl(`${window['STUDIO_API_PATH']}/qna/export`)
  }

  const handleScroll = () => {
    if (wrapperRef.current.scrollHeight - wrapperRef.current.scrollTop !== wrapperRef.current.offsetHeight) {
      return
    }

    dispatch({ type: 'fetchMore' })
  }

  const tabs = [
    !isLite && {
      id: 'qna',
      title: lang.tr('qna.fullName')
    }
  ]

  const allExpanded = Object.keys(expandedItems).filter((itemId) => expandedItems[itemId]).length === items.length

  let noItemsTooltip
  let languesTooltip = lang.tr('qna.form.translate')

  if (!items.length) {
    noItemsTooltip = lang.tr('qna.form.addOneItemTooltip')
  }

  if (languages?.length <= 1) {
    languesTooltip = lang.tr('qna.form.onlyOneLanguage')
  }

  const buttons = [
    {
      icon: 'translate',
      optionsItems: languages?.map((language) => ({
        label: lang.tr(`isoLangs.${language}.name`),
        selected: currentLang === language,
        action: () => {
          setCurrentLang(language)
        }
      })),
      disabled: !items.length || languages?.length <= 1,
      tooltip: noItemsTooltip || languesTooltip
    },
    {
      icon: allExpanded ? 'collapse-all' : 'expand-all',
      disabled: !items.length,
      onClick: () => dispatch({ type: allExpanded ? 'collapseAll' : 'expandAll' }),
      tooltip: noItemsTooltip || lang.tr(allExpanded ? 'collapseAll' : 'expandAll')
    },
    {
      icon: 'export',
      disabled: !items.length,
      onClick: startDownload,
      tooltip: noItemsTooltip || lang.tr('exportToJson')
    },
    {
      icon: 'import',
      onClick: () => setShowImportModal(true),
      tooltip: lang.tr('importJson')
    },
    {
      icon: 'plus',
      onClick: () => {
        dispatch({ type: 'addQnA', data: { languages, contexts: ['global'] } })
      },
      tooltip: lang.tr('qna.form.addQuestion')
    }
  ]

  const fetchData = async (page = 1) => {
    dispatch({ type: 'loading' })
    const params = { limit: ITEMS_PER_PAGE, offset: (page - 1) * ITEMS_PER_PAGE, filteredContexts: filterContexts }

    const { data } = await axios.get(`${window.STUDIO_API_PATH}/qna/questions`, {
      params: { ...params, question: questionSearch }
    })

    dispatch({ type: 'dataSuccess', data: { ...data, page } })
  }

  const fetchHighlightedQna = async (id) => {
    const { data } = await axios.get(`${window.STUDIO_API_PATH}/qna/questions/${id}`)

    dispatch({ type: 'highlightedSuccess', data })
  }

  const hasFilteredResults = questionSearch.length || filterContexts.length

  const toolBarRightContent = (
    <div className={style.searchWrapper}>
      <input
        className={style.input}
        type="text"
        value={questionSearch}
        onChange={(e) => setQuestionSearch(e.currentTarget.value)}
        placeholder={lang.tr('qna.search')}
      />

      {!isLite && (
        <ContextSelector
          className={style.contextInput}
          contexts={filterContexts}
          saveContexts={(contexts) => setFilterContexts(contexts)}
          isSearch
        />
      )}
    </div>
  )

  return (
    <MainLayout.Wrapper childRef={(ref) => (wrapperRef.current = ref)}>
      <MainLayout.Toolbar
        className={style.header}
        tabChange={setCurrentTab}
        tabs={tabs}
        // @ts-ignore
        buttons={buttons}
        rightContent={toolBarRightContent}
      />
      <div className={cx(style.content, { [style.empty]: !items.length && !highlighted })}>
        {highlighted && (
          <div className={style.highlightedQna}>
            <QnA
              updateQnA={(data) =>
                debounceDispatchMiddleware(dispatch, {
                  type: 'updateQnA',
                  data: { qnaItem: data, index: 'highlighted', bp, currentLang }
                })
              }
              convertToIntent={() => {
                dispatch({ type: 'convertQnA', data: { index: 'highlighted', bp } })
              }}
              isLite={isLite}
              key={highlighted.id}
              flows={flows}
              defaultLanguage={defaultLanguage}
              deleteQnA={() => {
                dispatch({ type: 'deleteQnA', data: { index: 'highlighted', bp } })
                window.history.pushState(
                  window.history.state,
                  '',
                  window.location.href.replace(window.location.search, '')
                )
              }}
              toggleEnabledQnA={() =>
                dispatchMiddleware(dispatch, {
                  type: 'toggleEnabledQnA',
                  data: { qnaItem: highlighted, bp }
                })
              }
              contentLang={currentLang}
              errorMessages={itemHasError(highlighted, currentLang)}
              setExpanded={(isExpanded) => dispatch({ type: 'toggleExpandOne', data: { highlighted: isExpanded } })}
              expanded={expandedItems['highlighted']}
              qnaItem={highlighted}
            />
          </div>
        )}
        {items
          .filter((item) => highlighted?.id !== item.id)
          .map((item, index) => (
            <QnA
              updateQnA={(data) =>
                debounceDispatchMiddleware(dispatch, {
                  type: 'updateQnA',
                  data: { qnaItem: data, index, bp, currentLang }
                })
              }
              key={item.key || item.id}
              isLite={isLite}
              flows={flows}
              defaultLanguage={defaultLanguage}
              convertToIntent={() => dispatch({ type: 'convertQnA', data: { index, bp } })}
              deleteQnA={() => dispatch({ type: 'deleteQnA', data: { index, bp } })}
              toggleEnabledQnA={() =>
                dispatchMiddleware(dispatch, { type: 'toggleEnabledQnA', data: { qnaItem: item, bp } })
              }
              contentLang={currentLang}
              errorMessages={itemHasError(item, currentLang)}
              setExpanded={(isExpanded) =>
                dispatch({ type: 'toggleExpandOne', data: { [item.key || item.id]: isExpanded } })
              }
              expanded={expandedItems[item.key || item.id]}
              qnaItem={item}
            />
          ))}
        {!items.length && !loading && (
          <EmptyState
            icon={<EmptyStateIcon />}
            text={hasFilteredResults ? lang.tr('qna.form.noResultsFromFilters') : lang.tr('qna.form.emptyState')}
          />
        )}
        {loading && (
          <Spinner
            className={cx({ [style.initialLoading]: !fetchMore, [style.loading]: fetchMore })}
            size={fetchMore ? 20 : 50}
          />
        )}
      </div>

      <Downloader url={url} />

      <ImportModal
        onImportCompleted={() => fetchData()}
        isOpen={showImportModal}
        toggle={() => setShowImportModal(!showImportModal)}
      />
    </MainLayout.Wrapper>
  )
}

export default withLanguage(QnAList)
