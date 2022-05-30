import React, { useMemo, FC } from 'react'
import { connect } from 'react-redux'

import { fetchContentItem, upsertContentItem } from '~/src/actions'
import FormKit from '../../FormKit'
import { Text } from '../../FormKit/shared'
import TextForm from './TextForm'

interface OwnProps {
  contentId: any
  items: any
  upsertContentItem: any
  fetchContentItem: any
}

const ContentPane: FC<OwnProps> = ({ contentId, items, upsertContentItem, fetchContentItem }) => {
  const { id, contentType, formData } = useMemo(() => {
    return items[contentId]
  }, [contentId, items])

  return (
    <FormKit
      initialValues={{
        ...formData
      }}
      onSubmit={(formData, { setSubmitting }) => {
        upsertContentItem({ modifyId: id, contentType, formData })
          .then(() => fetchContentItem(id, { force: true }))
          .then(() => setSubmitting(false))
      }}
    >
      <Text value={contentId} />
      <TextForm />
    </FormKit>
  )
}

const mapStateToProps = (state) => ({
  items: state.content.itemsById
})

const mapDispatchToProps = {
  upsertContentItem,
  fetchContentItem
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentPane)
