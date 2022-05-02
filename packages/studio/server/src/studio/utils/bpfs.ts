import { DirectoryListingOptions } from '@botpress/sdk'
import { Promise } from 'bluebird'
import fse from 'fs-extra'
import glob from 'glob'
import _ from 'lodash'
import path from 'path'
import tar from 'tar'
import tmp from 'tmp'
import VError from 'verror'

export interface bpfs {
  upsertFile(filePath: string, content: Buffer | string): Promise<void>
  readFile(filePath: string): Promise<Buffer>
  fileExists(filePath: string): Promise<boolean>
  deleteFile(filePath: string): Promise<void>
  deleteDir(dirPath: string): Promise<void>
  directoryListing(folder: string, options: DirectoryListingOptions): Promise<string[]>
  fileSize(filePath: string): Promise<number>
  moveFile(fromPath: string, toPath: string): Promise<void>
  exportToArchiveBuffer(): Promise<Buffer>
}

const forceForwardSlashes = (path: string) => path.replace(/\\/g, '/')
const resolvePath = (p: string) => path.resolve(process.DATA_LOCATION, p)

export const Instance: bpfs = {
  async upsertFile(filePath: string, content: string | Buffer): Promise<void> {
    await fse.ensureDir(path.dirname(resolvePath(filePath)))
    return fse.writeFile(resolvePath(filePath), content)
  },
  readFile(filePath: string): Promise<Buffer> {
    return fse.readFile(resolvePath(filePath))
  },
  fileExists(filePath: string): Promise<boolean> {
    return fse.pathExists(resolvePath(filePath))
  },
  deleteFile(filePath: string): Promise<void> {
    return fse.unlink(resolvePath(filePath))
  },
  deleteDir(dirPath: string): Promise<void> {
    return fse.remove(resolvePath(dirPath))
  },
  async directoryListing(
    folder: string,
    options: DirectoryListingOptions = {
      excludes: [],
      includeDotFiles: false
    }
  ): Promise<string[]> {
    try {
      await fse.access(resolvePath(folder), fse.constants.R_OK)
    } catch (e: any) {
      // if directory doesn't exist we don't care
      if (e.code === 'ENOENT') {
        return []
      }

      throw new VError(e, `[Disk Storage] No read access to directory "${folder}"`)
    }

    const globOptions: glob.IOptions = {
      cwd: resolvePath(folder),
      dot: options.includeDotFiles
    }

    // options.excludes can either be a string or an array of strings or undefined
    if (Array.isArray(options.excludes)) {
      globOptions['ignore'] = options.excludes
    } else if (options.excludes) {
      globOptions['ignore'] = [options.excludes]
    } else {
      globOptions['ignore'] = []
    }

    try {
      const files = await Promise.fromCallback<string[]>((cb) => glob('**/*.*', globOptions, cb))
      if (!options.sortOrder) {
        return files.map((filePath) => forceForwardSlashes(filePath))
      }

      const { column, desc } = options.sortOrder

      const filesWithDate = await Promise.map(files, async (filePath) => ({
        filePath,
        modifiedOn: (await fse.stat(path.join(resolvePath(folder), filePath))).mtime
      }))

      return _.orderBy(filesWithDate, [column], [desc ? 'desc' : 'asc']).map((x) => forceForwardSlashes(x.filePath))
    } catch (e) {
      return []
    }
  },

  async fileSize(filePath: string): Promise<number> {
    return (await fse.stat(resolvePath(filePath))).size
  },
  moveFile(fromPath: string, toPath: string): Promise<void> {
    return fse.move(resolvePath(fromPath), resolvePath(toPath))
  },
  async exportToArchiveBuffer(): Promise<Buffer> {
    const tmpDir = tmp.dirSync({ unsafeCleanup: true })
    const filename = path.join(tmpDir.name, 'archive.tgz')

    try {
      const files = await this.directoryListing('./', {})

      for (const file of files) {
        const content = await this.readFile(file)

        const outPath = path.join(tmpDir.name, file)
        await fse.mkdirp(path.dirname(outPath))
        await fse.writeFile(outPath, content)
      }

      try {
        await tar.create(
          {
            cwd: tmpDir.name,
            file: filename,
            portable: true,
            gzip: true
          },
          files
        )
        return await fse.readFile(filename)
      } catch (err) {
        throw new VError(err as Error, `[Instance] Error creating archive "${filename}"`)
      }
    } finally {
      tmpDir.removeCallback()
    }
  }
}
