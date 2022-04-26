import axios from 'axios'
import { DirectoryListingOptions, NLU, ContentElement } from 'botpress/sdk'
import { validate } from 'joi'
import _ from 'lodash'
import moment from 'moment'
import multer from 'multer'
import { customAlphabet } from 'nanoid'
import path from 'path'
import { QnaEntry, QnaItem } from '../../common/typings'
import { sanitizeFileName } from '../../common/utils'
import { StudioServices } from '../studio-router'
import { Instance } from '../utils/bpfs'
import { CustomStudioRouter } from '../utils/custom-studio-router'

import { QnaDefSchema, QnaItemCmsArraySchema } from './validation'

const QNA_DIR = 'qna'
const INTENT_DIR = 'intents'

interface FilteringOptions {
  questionFilter: string
  contextsFilter: string[]
}

type ContentData = Pick<ContentElement, 'id' | 'contentType' | 'formData'>
interface ImportData {
  questions?: QnaItem[]
  content?: ContentData[]
}

export class QNARouter extends CustomStudioRouter {
  constructor(services: StudioServices) {
    super('QNA', services.logger)
  }

  private async _prepareImport(parsedJson: any): Promise<ImportData> {
    const result = (await validate(parsedJson, QnaItemCmsArraySchema)) as {
      contentElements: ContentData[]
      qnas: QnaItem[]
    }
    return { questions: result.qnas, content: result.contentElements } as ImportData
  }

  private _normalizeQuestion(question: string): string {
    return question
      .replace(/[\r\n]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private _makeIntentId(qnaId: string): string {
    return `__qna__${qnaId}`
  }

  private _makeIntentFromQna(qnaItem: QnaItem): NLU.IntentDefinition {
    const utterances: { [key: string]: any } = {}
    for (const lang in qnaItem.data.questions) {
      utterances[lang] = qnaItem.data.questions[lang].map(this._normalizeQuestion).filter(Boolean)
    }
    return {
      name: this._makeIntentId(qnaItem.id),
      contexts: qnaItem.data.contexts,
      utterances,
      slots: []
    }
  }

  private _makeID(qna: QnaEntry) {
    const firstQuestion = qna.questions[Object.keys(qna.questions)[0]][0]
    const safeId = customAlphabet('1234567890abcdefghijklmnopqrsuvwxyz', 10)()
    return `${safeId}_${sanitizeFileName(firstQuestion).replace(/^_+/, '').substring(0, 50).replace(/_+$/, '')}`
  }

  private applyFilters(qnaItem: QnaItem, options: FilteringOptions): boolean {
    const qFilter = options.questionFilter.toLowerCase()
    const { questions, contexts } = qnaItem.data

    const contextMatches = !options.contextsFilter.length || !!_.intersection(contexts, options.contextsFilter).length
    if (!qFilter) {
      return contextMatches
    }

    const idMachesQuestionFilter = qnaItem.id.includes(qFilter)
    const contentMatchesQuestionFilter = JSON.stringify(Object.values(questions)).toLowerCase().includes(qFilter)

    return (idMachesQuestionFilter || contentMatchesQuestionFilter) && contextMatches
  }

  setupRoutes() {
    const router = this.router

    router.get(
      '/questions',
      this.needPermissions('read', 'module.qna'),
      this.asyncMiddleware(async (req, res) => {
        try {
          const {
            query: { question = '', filteredContexts = [], limit = 50, offset = 0 }
          } = req

          const options: DirectoryListingOptions = { sortOrder: { column: 'filePath', desc: true } }
          const qnas = await Instance.directoryListing(QNA_DIR, options).then((filePaths) => {
            return Promise.map(filePaths, (filePath) =>
              Instance.readFile(path.join(QNA_DIR, filePath)).then((buf) => JSON.parse(buf.toString()) as QnaItem)
            )
          })

          const filteredItems = qnas.filter((qnaItem) =>
            this.applyFilters(qnaItem, <FilteringOptions>{ questionFilter: question, contextsFilter: filteredContexts })
          )

          const pagedItems = filteredItems.slice(+offset, +offset + +limit)
          res.send({ items: pagedItems, count: filteredItems.length })
        } catch (e: any) {
          this.logger.attachError(e).error('Error listing questions')
          res.status(500).send(e.message || 'Error')
        }
      })
    )

    router.post(
      '/questions',
      this.needPermissions('write', 'module.qna'),
      this.asyncMiddleware(async (req, res) => {
        const qnaEntry = req.body as QnaEntry
        const id = this._makeID(qnaEntry)
        const qnaItem: QnaItem = { data: qnaEntry, id }

        await Instance.upsertFile(path.join(QNA_DIR, qnaItem.id + '.json'), JSON.stringify(qnaItem, undefined, 2))

        if (qnaEntry.enabled) {
          const intentDef = this._makeIntentFromQna(qnaItem)
          await Instance.upsertFile(
            path.join(INTENT_DIR, sanitizeFileName(intentDef.name) + '.json'),
            JSON.stringify(intentDef, undefined, 2)
          )
        }

        res.send([id])
      })
    )

    router.get(
      '/questions/:id',
      this.needPermissions('read', 'module.qna'),
      this.asyncMiddleware(async (req, res) => {
        const question = await Instance.readFile(path.join(QNA_DIR, req.params.id + '.json')).then(
          (buff) => JSON.parse(buff.toString()) as QnaItem
        )
        res.send(question)
      })
    )

    router.post(
      '/questions/:id',
      this.needPermissions('write', 'module.qna'),
      this.asyncMiddleware(async (req, res) => {
        const qnaEntry = (await validate(req.body, QnaDefSchema)) as QnaEntry
        const qnaItem: QnaItem = { data: qnaEntry, id: req.params.id }

        await Instance.upsertFile(path.join(QNA_DIR, qnaItem.id + '.json'), JSON.stringify(qnaItem, undefined, 2))
        if (qnaItem.data.enabled) {
          const intentDef = this._makeIntentFromQna(qnaItem)
          await Instance.upsertFile(
            path.join(INTENT_DIR, sanitizeFileName(intentDef.name) + '.json'),
            JSON.stringify(intentDef, undefined, 2)
          )
        } else {
          await Instance.deleteFile(path.join(INTENT_DIR, this._makeIntentId(qnaItem.id) + '.json'))
        }

        res.send(qnaItem)
      })
    )

    router.post(
      '/questions/:id/delete',
      this.needPermissions('write', 'module.qna'),
      this.asyncMiddleware(async (req, res) => {
        await Instance.deleteFile(path.join(QNA_DIR, req.params.id + '.json'))
        res.sendStatus(200)
      })
    )

    router.post(
      '/questions/:id/convert',
      this.needPermissions('write', 'module.qna'),
      this.asyncMiddleware(async (req, res) => {
        const intentId = this._makeIntentId(req.params.id)
        const initialIntentPath = path.join(INTENT_DIR, intentId + '.json')
        if (!(await Instance.fileExists(initialIntentPath))) {
          return res.sendStatus(404)
        }

        const intent = await Instance.readFile(initialIntentPath).then((buf) => JSON.parse(buf.toString()))
        if (!intent) {
          return res.sendStatus(404)
        }

        intent.name = intent.name.replace('__qna__', '')
        const newIntentPath = initialIntentPath.replace('__qna__', '')

        await Promise.all([
          Instance.upsertFile(newIntentPath, JSON.stringify(intent, undefined, 2)),
          Instance.deleteFile(initialIntentPath),
          Instance.deleteFile(path.join(QNA_DIR, req.params.id + '.json'))
        ])

        res.sendStatus(200)
      })
    )

    router.get(
      '/export',
      this.needPermissions('read', 'module.qna'),
      this.asyncMiddleware(async (req, res) => {
        const options: DirectoryListingOptions = { sortOrder: { column: 'filePath', desc: true } }
        const qnas = await Instance.directoryListing(QNA_DIR, options).then((filePaths) => {
          return Promise.map(filePaths, (filePath) =>
            Instance.readFile(path.join(QNA_DIR, filePath)).then((buf) => JSON.parse(buf.toString()) as QnaItem)
          )
        })

        const contentElementIds = _.chain(qnas)
          .flatMapDeep((qna) => Object.values(qna.data.answers))
          .filter((a) => a.startsWith('#!'))
          .map((a) => a.replace('#!', ''))
          .uniq()
          .value()

        const contentElements = await Promise.map(contentElementIds, (id) => {
          return axios
            .get(`http://${process.HOST}:${process.PORT}/api/v1/studio/${req.params.botId}/cms/element/${id}`)
            .then((res) => _.pick(res.data, ['id', 'contentType', 'formData']))
        })

        const data = JSON.stringify({ qnas, contentElements }, undefined, 2)
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-disposition', `attachment; filename=qna_${moment().format('DD-MM-YYYY')}.json`)
        res.end(data)
      })
    )

    const upload = multer()
    router.post(
      '/import',
      this.needPermissions('write', 'module.qna'),
      upload.single('file'),
      this.asyncMiddleware(async (req, res) => {
        if (req.body.action === 'clear_insert') {
          await Instance.deleteDir(QNA_DIR)
        }

        try {
          const parsed = JSON.parse((req as any).file.buffer)
          const result = await this._prepareImport(parsed)

          const contentPromises = (result?.content ?? []).map((content) =>
            axios.post(
              `http://${process.HOST}:${process.PORT}/api/v1/studio/${req.params.botId}/cms/${content.contentType}/element/${content.id}`,
              {
                formData: content
              }
            )
          )
          const qnaPromises = (result?.questions ?? []).map((item) =>
            Instance.upsertFile(path.join(QNA_DIR, item.id + '.json'), JSON.stringify(item, undefined, 2))
          )
          await Promise.all([...contentPromises, ...qnaPromises])
          res.end()
        } catch (err) {
          res.status(400).send('invalid payload')
        }
      })
    )

    router.get(
      '/contentElementUsage',
      this.needPermissions('read', 'module.qna'),
      this.asyncMiddleware(async (req, res) => {
        const qnas = await Instance.directoryListing(QNA_DIR, {}).then((filePaths) => {
          return Promise.map(filePaths, (filePath) =>
            Instance.readFile(path.join(QNA_DIR, filePath)).then((buf) => JSON.parse(buf.toString()) as QnaItem)
          )
        })

        const contentElements: { [key: string]: any } = {}

        for (const qna of qnas) {
          for (const answer of _.flatten(Object.values(qna.data.answers))) {
            if (answer.startsWith('#!')) {
              contentElements[answer] = _.uniq([...(contentElements[answer] || []), qna.id])
            }
          }
        }

        res.send(contentElements)
      })
    )

    router.post(
      '/analyzeImport',
      this.needPermissions('write', 'module.qna'),
      upload.single('file'),
      this.asyncMiddleware(async (req, res) => {
        const parsed = JSON.parse((req as any).file.buffer)
        const importData = await this._prepareImport(parsed)

        const qnas = await Instance.directoryListing(QNA_DIR, {}).then((filePaths) => {
          return Promise.map(filePaths, (filePath) =>
            Instance.readFile(path.join(QNA_DIR, filePath)).then((buf) => JSON.parse(buf.toString()) as QnaItem)
          )
        })

        const cmsCount = _.chain(qnas)
          .flatMapDeep((qna) => Object.values(qna.data.answers))
          .filter((a) => a.startsWith('#!'))
          .uniq()
          .value().length

        res.send({
          cmsCount,
          qnaCount: qnas.length,
          fileQnaCount: importData?.questions?.length ?? 0,
          fileCmsCount: importData?.content?.length ?? 0
        })
      })
    )
  }
}
