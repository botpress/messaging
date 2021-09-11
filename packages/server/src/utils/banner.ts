import chalk from 'chalk'

import _ from 'lodash'
import moment from 'moment'
import { Logger, logIndent } from '../logger/types'

interface BannerConfig {
  title: string
  version: string
  /** Length of the logger label */
  labelLength: number
  /** Length of the complete line */
  lineWidth: number
  logger: Logger
}

interface BuildMetadata {
  version: string
  date: number
  branch: string
}

export const centerText = (text: string, width: number, indent: number = 0) => {
  const padding = Math.floor((width - text.length) / 2)
  return _.repeat(' ', padding + indent) + text + _.repeat(' ', padding)
}

export const showBanner = (config: BannerConfig) => {
  const { title, version, labelLength, lineWidth, logger } = config
  let buildMetadata

  try {
    const metadata: BuildMetadata = require('../metadata.json')
    const builtFrom = process.pkg ? 'BIN' : 'SRC'
    const branchInfo = metadata.branch !== 'master' ? `/${metadata.branch}` : ''

    buildMetadata = `Build ${moment(metadata.date).format('YYYYMMDD-HHmm')}_${builtFrom}${branchInfo}`
  } catch (err) {}

  const infos = [`Version ${version}`, buildMetadata].filter((x) => x !== undefined)
  const border = _.repeat('=', lineWidth)
  const indent = _.repeat(' ', logIndent)

  logger.info(`${border}
${indent}${chalk.bold(centerText(title, lineWidth, labelLength))}
${indent}${chalk.gray(centerText(infos.join(' - '), lineWidth, labelLength))}
${indent}${_.repeat(' ', labelLength)}${border}`)
}
