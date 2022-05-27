import React, { useMemo, FC } from 'react'
import { connect } from 'react-redux'

import { fetchContentItem, upsertContentItem } from '~/src/actions'
import FormKit from '../../FormKit'
import { Autosave } from '../../FormKit/formHooks'
import { Text } from '../../FormKit/shared'
import TextForm from './TextForm'

interface OwnProps {
  contentId: any
  items: any
  upsertContentItem: any
  fetchContentItem: any
}

const ContentPane: FC<OwnProps> = ({ contentId, items, upsertContentItem, fetchContentItem }) => {
  const { id, contentType, createdBy, formData } = useMemo(() => {
    return items[contentId]
  }, [contentId, items])

  return (
    <FormKit
      initialValues={{
        ...formData
      }}
      onSubmit={(formData, { setSubmitting }) => {
        console.log('form save', formData)
        upsertContentItem({ modifyId: id, contentType, formData })
          .then(() => fetchContentItem(id, { force: true }))
          .then(() => setSubmitting())
      }}
    >
      <Autosave />
      <span>Last Edited by: {createdBy}</span>
      <Text value={contentId} />
      <TextForm />
    </FormKit>
  )
}
// markdown$en: true
// text$en: "we need a complicated bot that has a lot of content so that we can stress test our design and css breakpoints."
// typing$en: true

const mapStateToProps = (state) => ({
  items: state.content.itemsById
})

const mapDispatchToProps = {
  upsertContentItem,
  fetchContentItem
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentPane)
