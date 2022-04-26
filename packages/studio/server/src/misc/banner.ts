import sdk from 'botpress/sdk'
import chalk from 'chalk'
import _ from 'lodash'
import moment from 'moment'

export const centerText = (text: string, width: number, indent: number = 0) => {
  const padding = Math.floor((width - text.length) / 2)
  return _.repeat(' ', padding + indent) + text + _.repeat(' ', padding)
}

interface BannerConfig {
  title: string
  version: string
  bannerWidth: number
  logScopeLength: number
  logger: sdk.Logger
}

interface BuildMetadata {
  version: string
  date: number
  branch: string
}

export const showBanner = (config: BannerConfig) => {
  const { title, version, logScopeLength, bannerWidth, logger } = config
  let buildMetadata

  try {
    const metadata: BuildMetadata = require('../../metadata.json')
    const builtFrom = process.pkg ? 'BIN' : 'SRC'
    const branchInfo = metadata.branch !== 'master' ? `/${metadata.branch}` : ''

    buildMetadata = `Build ${moment(metadata.date).format('YYYYMMDD-HHmm')}_${builtFrom}${branchInfo}`
  } catch (err) {}

  const infos = [`Version ${version}`, buildMetadata].filter((x) => x !== undefined)
  const border = _.repeat('=', bannerWidth)

  logger.info(`${border}
${chalk.bold(centerText(title, bannerWidth, logScopeLength))}
${chalk.gray(centerText(infos.join(' - '), bannerWidth, logScopeLength))}
${_.repeat(' ', logScopeLength)}${border}`)
}
