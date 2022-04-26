import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import { changeContentLanguage } from '~/actions'

const mapStateToProps = (state) => ({
  contentLang: state.language.contentLang,
  defaultLanguage: _.get(state.bot, 'bot.defaultLanguage', []),
  languages: _.get(state.bot, 'bot.languages', []).sort()
})

const mapDispatchToProps = { changeContentLanguage }

export default (Wrapped) => {
  const withLanguage = (props) => <Wrapped {...props} />
  return connect(mapStateToProps, mapDispatchToProps)(withLanguage)
}
