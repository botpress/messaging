import axios from 'axios'
import { EditableFile, FilePermissions, FilesDS } from 'common/code-editor'
import _ from 'lodash'
import { toast } from '~/components/Shared/Toaster'
import { lang } from '~/components/Shared/translations'

export default class CodeEditorApi {
  constructor() {}

  async fetchPermissions(): Promise<FilePermissions> {
    try {
      const { data } = await axios.get(`${window.STUDIO_API_PATH}/code-editor/permissions`)
      return data
    } catch (err) {
      console.error('Error while fetching code editor permissions', err)
    }
  }

  async fetchFiles(): Promise<FilesDS> {
    try {
      const { data } = await axios.get(`${window.STUDIO_API_PATH}/code-editor/files`)
      return data
    } catch (err) {
      this.handleApiError(err, 'Could not fetch files from server')
    }
  }

  async fetchTypings(): Promise<any> {
    try {
      const { data } = await axios.get(`${window.STUDIO_API_PATH}/code-editor/typings`)
      return data
    } catch (err) {
      console.error('Error while fetching typings', err)
    }
  }

  async deleteFile(file: EditableFile): Promise<boolean> {
    try {
      await axios.post(`${window.STUDIO_API_PATH}/code-editor/remove`, file)
      return true
    } catch (err) {
      this.handleApiError(err, 'Could not delete your file')
    }
  }

  async renameFile(file: EditableFile, newName: string): Promise<boolean> {
    try {
      await axios.post(`${window.STUDIO_API_PATH}/code-editor/rename`, { file, newName })
      return true
    } catch (err) {
      this.handleApiError(err, 'Could not rename file')
    }
  }

  async fileExists(file: EditableFile): Promise<boolean> {
    try {
      const { data } = await axios.post(`${window.STUDIO_API_PATH}/code-editor/exists`, file)
      return data
    } catch (err) {
      this.handleApiError(err, 'Could not check if file already exists')
    }
  }

  async readFile(file: EditableFile): Promise<string> {
    try {
      const { data } = await axios.post(`${window.STUDIO_API_PATH}/code-editor/readFile`, file)
      return data.fileContent
    } catch (err) {
      this.handleApiError(err, 'Could not check if file already exists')
    }
  }

  async downloadFile(file: EditableFile) {
    try {
      const { data } = await axios.post(`${window.STUDIO_API_PATH}/code-editor/download`, file, {
        responseType: 'blob'
      })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([data]))
      link.download = file.name
      link.click()
    } catch (err) {
      this.handleApiError(err, 'Could not check if file already exists')
    }
  }

  async saveFile(file: EditableFile): Promise<boolean> {
    try {
      await axios.post(`${window.STUDIO_API_PATH}/code-editor/save`, file)
      return true
    } catch (err) {
      this.handleApiError(err, 'code-editor.error.cannotSaveFile')
    }
  }

  async uploadFile(data: FormData): Promise<boolean> {
    try {
      await axios.post(`${window.STUDIO_API_PATH}/code-editor/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return true
    } catch (err) {
      this.handleApiError(err, 'code-editor.error.cannotUploadFile')
    }
  }

  handleApiError = (error, customMessage?: string) => {
    if (error.response && error.response.status === 403) {
      return // not enough permissions, nothing to do
    }
    const data = _.get(error, 'response.data', {})
    const errorInfo = data.full || data.message

    customMessage
      ? toast.failure(`${lang.tr(customMessage)}: ${lang.tr(errorInfo, { details: data.details })}`)
      : toast.failure(errorInfo, data.details)
  }
}
