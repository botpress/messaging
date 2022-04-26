import {
  Client as StanClient,
  Specifications as StanSpecifications,
  TrainingState as StanTrainingState,
  TrainInput as StanTrainInput
} from '@botpress/nlu-client'
import { CloudConfig } from 'botpress/sdk'
import _ from 'lodash'
import { CloudClient } from './cloud/client'

interface Options {
  baseURL: string
  cloud?: CloudConfig
}

/**
 * in "@botpress/nlu-client@v1.0.0": typeof response.error === "string"
 * in "@botpress/nlu-client@v1.0.1": typeof response.error === "object"
 */
interface NLUError {
  message: string
  stack?: string
  type: string
  code: number
}

/** Wrapper over actual nlu-client to map errors */
export class NLUClient {
  private _client: StanClient | CloudClient

  constructor(options: Options) {
    const { baseURL, cloud } = options
    this._client = cloud
      ? new CloudClient({ baseURL, ...cloud })
      : new StanClient({ baseURL: options.baseURL, validateStatus: () => true })
  }

  public async getInfo(): Promise<{
    specs: StanSpecifications
    languages: string[]
  }> {
    const response = await this._client.getInfo()
    if (!response.success) {
      return this._throwError(response.error)
    }
    return response.info
  }

  public async startTraining(appId: string, trainInput: StanTrainInput & { contexts: string[] }): Promise<string> {
    const response = await this._client.startTraining(appId, trainInput)
    if (!response.success) {
      return this._throwError(response.error)
    }
    return response.modelId
  }

  public async getTraining(appId: string, modelId: string): Promise<StanTrainingState | undefined> {
    const response = await this._client.getTrainingStatus(appId, modelId)
    if (!response.success) {
      return
    }
    return response.session
  }

  public async listModels(appId: string): Promise<string[]> {
    const response = await this._client.listModels(appId)
    if (!response.success) {
      return this._throwError(response.error)
    }
    return response.models
  }

  public async cancelTraining(appId: string, modelId: string): Promise<void> {
    const response = await this._client.cancelTraining(appId, modelId)
    if (!response.success) {
      return this._throwError(response.error)
    }
  }

  public async downloadModelWeights(appId: string, modelId: string): Promise<Buffer> {
    const downloadRes = await this._client.modelWeights.download(appId, modelId, { responseType: 'arraybuffer' })
    if (downloadRes.status !== 'OK') {
      throw new Error(`Download weights received status ${downloadRes.status}`)
    }

    return downloadRes.weights
  }

  private _throwError(err: string | NLUError): never {
    const prefix = 'An error occured in NLU server'
    if (_.isString(err)) {
      throw new Error(`${prefix}: ${err}`)
    }
    throw new Error(`${prefix}: ${err.message}`)
  }
}
