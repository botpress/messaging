import _ from 'lodash'
import minimatch from 'minimatch'
import { Instance } from '../../studio/utils/bpfs'

import BaseHints from './base-hints'
import FileBasedProviders from './file-based'

export interface FileBasedHintProvider {
  readonly filePattern: string | string[]
  readonly readFile: boolean
  indexFile: (filePath: string, content: string) => Hint[]
}

export interface Hint {
  scope: 'inputs'
  name: string
  source: string
  category: 'VARIABLES'
  partial: boolean
  description?: string
  location?: string
  parentObject?: string
}

export class HintsService {
  hints: { [key: string]: Hint[] } = {}

  private async indexFile(filePath: string): Promise<Hint[]> {
    let content: string | undefined = undefined

    return _.flatten(
      await Promise.mapSeries(FileBasedProviders, async (provider) => {
        const patterns = Array.isArray(provider.filePattern) ? provider.filePattern : [provider.filePattern]
        const matched = _.some(patterns, (p) => minimatch(filePath, p, { nocase: true, nonull: true, dot: true }))

        if (!matched) {
          return []
        }

        try {
          content = content || (await Instance.readFile(filePath)).toString()
        } catch (err) {
          // May happens if file deleted, renamed etc
          return []
        }

        return provider.indexFile(filePath, content || '') as Hint[]
      })
    )
  }

  async refreshAll(): Promise<void> {
    const hints: { [key: string]: any } = {}
    hints['global/base'] = BaseHints
    const files = [...(await Instance.directoryListing('./', { includeDotFiles: true }))]
    await Promise.mapSeries(files, async (file) => (hints[file] = await this.indexFile(file)))
    this.hints = hints
  }

  async getHints(): Promise<Hint[]> {
    return _.flatten(Object.values(this.hints))
  }
}
