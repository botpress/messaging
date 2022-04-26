import { Button, Icon, Position } from '@blueprintjs/core'
import { Flow, FlowNode } from 'botpress/sdk'
import cx from 'classnames'
import { QnaItem } from 'common/typings'
import _uniqueId from 'lodash/uniqueId'
import React, { FC, Fragment, useMemo, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Select from 'react-select'
import confirmDialog from '~/components/Shared/ConfirmDialog'
import MoreOptions from '~/components/Shared/MoreOptions'
import { MoreOptionsItems } from '~/components/Shared/MoreOptions/typings'
import { toast } from '~/components/Shared/Toaster'
import ToolTip from '~/components/Shared/ToolTip'
import { lang } from '~/components/Shared/translations'
import { inspect } from '~/components/Shared/utilities/inspect'

import { getFlowLabel } from '~/components/Shared/Utils'
import { isRTLLocale } from '~/translations'
import style from '../style.scss'
import { NEW_QNA_PREFIX } from '../utils/qnaList.utils'
import ContextSelector from './ContextSelector'
import TextAreaList from './TextAreaList'

interface RedirectItem {
  label: string
  value: string
}

interface Props {
  isLite: boolean
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  qnaItem: QnaItem
  contentLang: string
  defaultLanguage: string
  errorMessages?: string[]
  flows?: Flow[]
  childRef?: (ref: HTMLDivElement | null) => void
  updateQnA: (qnaItem: QnaItem) => void
  deleteQnA: () => void
  convertToIntent: () => void
  toggleEnabledQnA: () => void
}

const QnA: FC<Props> = (props) => {
  const [showOption, setShowOption] = useState(false)
  const {
    contentLang,
    qnaItem: { id, saveError, data },
    updateQnA,
    expanded,
    setExpanded,
    errorMessages,
    defaultLanguage,
    flows
  } = props

  const [showRedirectToFlow, setShowRedirectToFlow] = useState(!!(data.redirectFlow || data.redirectNode))
  let questions = data.questions[contentLang]
  let answers = data.answers[contentLang]
  const refQuestions = contentLang !== defaultLanguage && data.questions[defaultLanguage]
  const refAnswers = contentLang !== defaultLanguage && data.answers[defaultLanguage]
  const contentDirection = useMemo(() => (isRTLLocale(contentLang) ? 'rtl' : 'ltr'), [contentLang])

  if (refQuestions?.length > questions?.length || (!questions?.length && refQuestions?.length)) {
    questions = [...(questions || []), ...Array(refQuestions.length - (questions?.length || 0)).fill('')]
  }

  if (refAnswers?.length > answers?.length || (!answers?.length && refAnswers?.length)) {
    answers = [...(answers || []), ...Array(refAnswers.length - (answers?.length || 0)).fill('')]
  }

  const onDelete = async () => {
    if (
      await confirmDialog(lang.tr('qna.form.confirmDeleteQuestion'), {
        acceptLabel: lang.tr('delete')
      })
    ) {
      props.deleteQnA()
    }
  }

  const onConvertToIntent = async () => {
    if (
      await confirmDialog(lang.tr('qna.form.confirmConvertToIntent'), {
        acceptLabel: lang.tr('convert')
      })
    ) {
      props.convertToIntent()
    }
  }

  const moreOptionsItems: MoreOptionsItems[] = [
    {
      label: lang.tr(data.enabled ? 'qna.form.disableQuestion' : 'qna.form.enableQuestion'),
      action: props.toggleEnabledQnA
    }
  ]

  if (expanded) {
    moreOptionsItems.push({
      label: lang.tr(!showRedirectToFlow ? 'qna.form.enableRedirection' : 'qna.form.disableRedirection'),
      action: () => {
        if (showRedirectToFlow) {
          updateQnA({
            id,
            data: { ...data, redirectNode: '', redirectFlow: '' }
          })
        }
        setShowRedirectToFlow(!showRedirectToFlow)
      }
    })
  }

  moreOptionsItems.push({
    label: lang.tr('qna.form.deleteQuestion'),
    type: 'delete',
    action: onDelete
  })

  moreOptionsItems.push({
    label: lang.tr('qna.form.convertToIntent'),
    type: 'convert',
    action: onConvertToIntent
  })

  const getPlaceholder = (type: 'answer' | 'question', index: number): string => {
    if (type === 'question') {
      if (index === 0) {
        return lang.tr('qna.form.writeFirstQuestion')
      } else if (index === 1 || index === 2) {
        return lang.tr('qna.form.writeAtLeastTwoMoreQuestions')
      } else if (index >= 3 && index < 9) {
        return lang.tr('qna.form.addMoreQuestionsPlural', { count: 10 - index })
      } else if (index === 9) {
        return lang.tr('qna.form.addMoreQuestionsSingular')
      }
    } else {
      if (index === 0) {
        return lang.tr('qna.form.writeTheAnswer')
      } else {
        return lang.tr('qna.form.chatbotWillRandomlyChoose')
      }
    }
  }

  const validateItemsList = (items, errorMsg) =>
    items.map((item, index) =>
      items
        .slice(0, index)
        .filter((item2) => item2.length)
        .includes(item)
        ? errorMsg
        : ''
    )

  const showIncomplete =
    questions?.filter((q) => !!q.trim()).length < 3 ||
    (answers?.filter((q) => !!q.trim()).length < 1 && !data.redirectFlow && !data.redirectNode)
  const currentFlow = flows ? flows.find(({ name }) => name === data.redirectFlow) || { nodes: [] } : { nodes: [] }
  const nodeList = (currentFlow.nodes as FlowNode[])?.map(({ name }) => ({ label: name, value: name }))
  const flowsList = flows.map(({ name }) => ({ label: getFlowLabel(name), value: name }))
  const isNewQna = id.startsWith(NEW_QNA_PREFIX)

  return (
    <div className={style.questionWrapper}>
      <div className={style.headerWrapper}>
        <Button
          minimal
          small
          onClick={() => {
            inspect(props.qnaItem)
            setExpanded(!expanded)
          }}
          className={style.questionHeader}
        >
          <div className={style.left}>
            <Icon icon={!expanded ? 'chevron-right' : 'chevron-down'} />{' '}
            {!isNewQna && (
              <ToolTip
                className={cx(style.tag, style.qnaId)}
                position={Position.BOTTOM}
                content={lang.tr('qna.form.copyIdToClipboard')}
              >
                <CopyToClipboard text={id} onCopy={() => toast.info(lang.tr('qna.form.idCopiedToClipboard'))}>
                  <span onClick={(e) => e.stopPropagation()}>ID</span>
                </CopyToClipboard>
              </ToolTip>
            )}
            <h1>{questions?.[0] || <span className={style.refTitle}>{refQuestions?.[0]}</span>}</h1>
          </div>
          <div className={style.right}>
            {(!!errorMessages.length || saveError === 'duplicated_question') && (
              <ToolTip
                position={Position.BOTTOM}
                content={
                  <ul className={style.errorsList}>
                    {errorMessages.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {saveError === 'duplicated_question' && <li>{lang.tr('qna.form.writingSameQuestion')}</li>}
                  </ul>
                }
              >
                <span className={cx(style.tag, style.warning)}>{lang.tr('qna.form.cantBeSaved')}</span>
              </ToolTip>
            )}
            {!data.enabled && (
              <ToolTip position={Position.BOTTOM} content={lang.tr('qna.form.disabledTooltip')}>
                <span className={style.tag}>{lang.tr('disabled')}</span>
              </ToolTip>
            )}
            {showIncomplete && (
              <ToolTip position={Position.BOTTOM} content={lang.tr('qna.form.incompleteTooltip')}>
                <span className={cx(style.tag)}>{lang.tr('qna.form.incomplete')}</span>
              </ToolTip>
            )}
            <span className={style.tag}>
              {`${questions?.filter((q) => q.trim()).length || 0} ${lang.tr('qna.form.q')}
               · ${answers?.filter((a) => a.trim()).length || 0}  ${lang.tr('qna.form.a')}`}
            </span>
          </div>
        </Button>
        <MoreOptions show={showOption} onToggle={() => setShowOption(!showOption)} items={moreOptionsItems} wrapInDiv />
      </div>
      {expanded && (
        <div key={contentLang} className={style.collapsibleWrapper}>
          <ContextSelector
            className={cx(style.contextSelector)}
            contexts={data.contexts}
            customIdSuffix={id}
            saveContexts={(contexts) =>
              updateQnA({
                id,
                data: { ...data, contexts }
              })
            }
          />
          <TextAreaList
            key="questions"
            items={questions || ['']}
            updateItems={(items) =>
              updateQnA({
                id,
                data: { ...data, questions: { ...data.questions, [contentLang]: items }, answers: data.answers }
              })
            }
            refItems={refQuestions}
            keyPrefix="question-"
            duplicateMsg={lang.tr('qna.form.duplicateQuestion')}
            itemListValidator={validateItemsList}
            placeholder={(index) => getPlaceholder('question', index)}
            label={lang.tr('qna.question')}
            contentDirection={contentDirection}
            addItemLabel={lang.tr('qna.form.addQuestionAlternative')}
          />
          <TextAreaList
            key="answers"
            items={answers || ['']}
            duplicateMsg={lang.tr('qna.form.duplicateAnswer')}
            itemListValidator={validateItemsList}
            contentDirection={contentDirection}
            updateItems={(items) =>
              updateQnA({
                id,
                data: { ...data, questions: data.questions, answers: { ...data.answers, [contentLang]: items } }
              })
            }
            refItems={refAnswers}
            keyPrefix="answer-"
            placeholder={(index) => getPlaceholder('answer', index)}
            label={lang.tr('qna.answer')}
            canAddContent
            addItemLabel={lang.tr('qna.form.addAnswerAlternative')}
          />
          {showRedirectToFlow && (
            <Fragment>
              <h1 className={style.redirectTitle}>{lang.tr('qna.form.redirectQuestionTo')}</h1>
              <div>
                <h2>{lang.tr('qna.form.workflow')}</h2>

                <Select
                  value={flowsList.find((item) => item.value === data.redirectFlow)}
                  options={flowsList}
                  placeholder={lang.tr('qna.form.pickWorkflow')}
                  onChange={(selected: RedirectItem) =>
                    updateQnA({
                      id,
                      data: { ...data, redirectFlow: selected.value }
                    })
                  }
                  menuPortalTarget={document.getElementById('menuOverlayPortal')}
                />
              </div>
              <div>
                <h2>{lang.tr('qna.form.node')}</h2>

                <Select
                  value={nodeList.find((item) => item.value === data.redirectNode)}
                  options={nodeList}
                  placeholder={lang.tr('qna.form.pickNode')}
                  onChange={(selected: RedirectItem) =>
                    updateQnA({
                      id,
                      data: { ...data, redirectNode: selected.value }
                    })
                  }
                />
              </div>
            </Fragment>
          )}
        </div>
      )}
    </div>
  )
}

export default QnA
