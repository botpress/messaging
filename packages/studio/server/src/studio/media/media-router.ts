import { Promise } from 'bluebird'
import _ from 'lodash'

import path from 'path'
import { StudioServices } from '../studio-router'
import { Instance } from '../utils/bpfs'
import { CustomStudioRouter } from '../utils/custom-studio-router'
import { safeId, sanitize } from '../utils/file-names'
import { fileUploadMulter } from '../utils/http-multer'

const DEFAULT_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'video/mp4']
const DEFAULT_MAX_FILE_SIZE = '25mb'

class MediaRouter extends CustomStudioRouter {
  getFileUrl(botId: string, fileName: string) {
    // TODO: we need a router that returns those files (GET). I think it's part of the BP backend atm
    return `/api/v1/studio/${botId}/media/${encodeURIComponent(fileName)}`
  }

  getMediaFiles(formData: any): string[] {
    const media = '/media/'
    const iterator = (result: string[], value: any, key: string) => {
      if (key.startsWith('image') && value && value.includes(media)) {
        result.push(value.substr(value.indexOf(media) + media.length))
      } else if (key.startsWith('items$') && value.length) {
        value.forEach((e: any) => _.reduce(e, iterator, result))
      }
      return result
    }
    return _.reduce(formData, iterator, []).filter(Boolean)
  }

  constructor(services: StudioServices) {
    super('User', services.logger, services.nlu)
  }

  async setupRoutes() {
    // TODO: What do we do about those configs? Should they remain configurable? Are they fixed for Botpress Cloud? Are they per-bot?
    const router = this.router

    const mediaUploadMulter = fileUploadMulter(
      DEFAULT_ALLOWED_MIME_TYPES,
      DEFAULT_MAX_FILE_SIZE
      // botpressConfig.fileUpload.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES,
      // botpressConfig.fileUpload.maxFileSize ?? DEFAULT_MAX_FILE_SIZE
    )

    this.router.get(
      '/:file',
      this.asyncMiddleware(async (req, res) => {
        const { file } = req.params

        // TODO: we need to guard against a malicious filename here (not to serve any file on the system)
        if (await Instance.fileExists(path.join('media', file))) {
          res.sendFile(path.resolve(process.DATA_LOCATION, 'media', file))
        } else {
          res.sendStatus(404)
        }
      })
    )

    router.post(
      '/',
      this.checkTokenHeader,
      this.needPermissions('write', 'bot.media'),
      this.asyncMiddleware(async (req, res) => {
        const { botId } = req.params

        mediaUploadMulter(req, res, async (err: any) => {
          if (err) {
            return res.status(400).send(err.message)
          }

          const file = (req as any)['file']
          const fileName = sanitize(`${safeId(20)}-${path.basename(file.originalname)}`)

          await Instance.upsertFile(path.join('media', fileName), file.buffer)

          res.json({ url: this.getFileUrl(botId, fileName) })
        })
      })
    )

    router.post(
      '/delete',
      this.checkTokenHeader,

      this.needPermissions('write', 'bot.media'),
      this.asyncMiddleware(async (req, res) => {
        const files = this.getMediaFiles(req.body)

        await Promise.map(files, (f) => Instance.deleteFile(path.join('media', sanitize(f))))

        res.sendStatus(200)
      })
    )
  }
}

export default MediaRouter
