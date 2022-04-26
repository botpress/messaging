import { Promise } from 'bluebird'
import { ListenHandle, Logger } from 'botpress/sdk'
import { Training as BpTraining } from '../../../common/nlu-training'
import { DefinitionsRepository } from '../definitions-repository'
import { ModelEntryService, TrainingEntryService } from '../model-entry'
import { NLUClient } from '../nlu-client'
import { BotDefinition, TrainListener } from '../typings'
import { BotState } from './bot-state'
import { poll } from './polling'

export interface MountOptions {
  queueTraining: boolean
}

const TRAIN_POLL_INTERVAL = 500

export class Bot {
  private _needTrainingWatcher!: ListenHandle
  private _botState: BotState
  private _botId: string
  private _languages: string[]

  // TODO: needs training doesn't listen anymore on file changes

  constructor(
    botDef: BotDefinition,
    private _nluClient: NLUClient,
    private _defRepo: DefinitionsRepository,
    _models: ModelEntryService,
    _trainings: TrainingEntryService,
    private _logger: Logger,
    private _webSocket: TrainListener
  ) {
    this._botState = new BotState(botDef, _nluClient, _defRepo, _models, _trainings)
    this._botId = botDef.botId
    this._languages = botDef.languages
  }

  public mount = async (opt: MountOptions) => {
    if (!opt.queueTraining) {
      return
    }

    for (const l of this._languages) {
      const { status } = await this.syncAndGetState(l)
      if (status === 'needs-training') {
        // The train function reports progress and handles errors
        void this.train(l)
      }
    }
  }

  public unmount = async () => {
    this._needTrainingWatcher.remove()
  }

  public train = async (language: string): Promise<void> => {
    try {
      const pending = this._trainPending(language)
      this._webSocket(pending)

      await this._botState.startTraining(language)
      await poll(async () => {
        const ts = await this.syncAndGetState(language)
        this._webSocket(ts)
        const isStillTraining = ts.status === 'training' || ts.status === 'training-pending'
        return isStillTraining ? 'keep-polling' : 'stop-polling'
      }, TRAIN_POLL_INTERVAL)
    } catch (thrown) {
      const err = thrown instanceof Error ? thrown : new Error(`${thrown}`)
      this._logger.attachError(err).error('An error occured when training')

      const needsTraining = this._needsTraining(language)
      this._webSocket({ ...needsTraining, error: { message: err.message, type: 'internal' } })
    }
  }

  public refreshNeedsTraining = async (): Promise<void> => {
    await Promise.map(this._languages, async (l) => {
      const state = await this.syncAndGetState(l)
      this._webSocket(state)
    })
  }

  public async downloadModelWeights(appId: string, modelId: string): Promise<Buffer> {
    return this._nluClient.downloadModelWeights(appId, modelId)
  }

  public syncAndGetState = async (language: string): Promise<BpTraining> => {
    const needsTraining = this._needsTraining(language)
    const doneTraining = this._doneTraining(language)

    const training = await this._botState.getTraining(language)
    if (training) {
      if (training.status === 'done') {
        await this._botState.setModel(language, training) // erases the training
        return doneTraining
      }

      if (training.status === 'training' || training.status === 'training-pending') {
        const { status, progress } = training
        return { status, progress, language, botId: this._botId }
      }

      // canceled or error
      const { error } = training
      return { ...needsTraining, error }
    }

    const model = await this._botState.getModel(language)
    if (model) {
      const isDirty = await this._botState.isDirty(language, model)
      if (!isDirty) {
        return doneTraining
      }
    }

    return needsTraining
  }

  public cancelTraining = async (language: string) => {
    await this._botState.cancelTraining(language)
  }

  private _needsTraining = (language: string): BpTraining => ({
    status: 'needs-training',
    progress: 0,
    language,
    botId: this._botId
  })

  private _trainPending = (language: string): BpTraining => ({
    status: 'training-pending',
    progress: 0,
    language,
    botId: this._botId
  })

  private _doneTraining = (language: string): BpTraining => ({
    status: 'done',
    progress: 1,
    language,
    botId: this._botId
  })
}
