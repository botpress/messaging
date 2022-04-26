import mime from 'mime-types'
import multer from 'multer'

import { asBytes } from './file-size'

/**
 * This method checks that uploaded file respects constraints
 * @example fileUploadMulter(['image/*', 'audio/mpeg'], '150mb)
 * fileUploadMulter(['*'], '1gb)
 */
export const fileUploadMulter = (allowedMimeTypes: string[] = [], maxFileSize?: string) => {
  const allowedMimeTypesRegex = allowedMimeTypes.map((mimeType) => {
    // '*' is not a valid regular expression
    if (mimeType === '*') {
      mimeType = '.*'
    }

    return new RegExp(mimeType, 'i')
  })

  return multer({
    fileFilter: (_req: any, file: any, cb: any) => {
      const extMimeType = mime.lookup(file.originalname)
      if (
        allowedMimeTypesRegex.some((regex) => regex.test(file.mimetype)) &&
        extMimeType &&
        allowedMimeTypesRegex.some((regex) => regex.test(extMimeType))
      ) {
        return cb(null, true)
      }
      cb(new Error(`This type of file is not allowed: ${file.mimetype}`))
    },
    limits: {
      fileSize: (maxFileSize && asBytes(maxFileSize)) || undefined
    }
  }).single('file')
}
