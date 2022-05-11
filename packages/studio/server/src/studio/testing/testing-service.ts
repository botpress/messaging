import * as sdk from '@botpress/sdk'
import { nanoid } from 'nanoid'
import path from 'path'
import { Instance } from '../utils/bpfs'

import { Recorder } from './recorder'
import { ScenarioRunner } from './runner'
import { Preview, Scenario, State, Status } from './typings'
import { buildScenarioFromEvents } from './utils'

const SCENARIO_FOLDER = 'scenarios'
const TEST_COMPLETION_TIMEOUT = 2000

export class TestingService {
  private _scopedTestingServices: Map<string, ScopedTestingServiceService> = new Map()

  constructor(private logger: sdk.Logger) {}

  forBot(botId: string): ScopedTestingServiceService {
    if (this._scopedTestingServices.has(botId)) {
      return this._scopedTestingServices.get(botId)!
    }

    const scopedTestingService = new ScopedTestingServiceService(botId, this.logger)

    this._scopedTestingServices.set(botId, scopedTestingService)
    return scopedTestingService
  }
}

export class ScopedTestingServiceService {
  private _recorder: Recorder
  private _runner: ScenarioRunner
  private _scenarios: Scenario[]
  private _interval?: NodeJS.Timeout

  constructor(private _botId: string, private _logger: sdk.Logger) {
    this._recorder = new Recorder(this._logger)
    this._runner = new ScenarioRunner()
    this._scenarios = []
  }

  async startRecording(chatUserId: string): Promise<void> {
    await this._ensureHooksEnabled()

    this._recorder.startRecording(chatUserId)
  }

  endRecording(): Scenario | undefined {
    return this._recorder.stopRecording()
  }

  getState(): State {
    return {
      recording: this._recorder.isRecording(),
      running: this._runner.isRunning()
    }
  }

  async getScenarios(): Promise<(Scenario & Status)[]> {
    if (!this._scenarios.length) {
      await this._loadScenarios()
    }

    return this._scenarios.map(({ name, steps }) => {
      return {
        name,
        steps,
        ...(this._runner.getStatus(name!) || {})
      }
    })
  }

  async processIncomingEvent(event: sdk.IO.IncomingEvent): Promise<sdk.IO.EventState | undefined> {
    await this._recorder.processIncoming(event)

    return this._runner.processIncoming(event)
  }

  async processCompletedEvent(event: sdk.IO.IncomingEvent): Promise<void> {
    await this._recorder.processCompleted(event)

    return this._runner.processCompleted(event)
  }

  async buildScenario(eventIds: string[]) {
    const events = await this._findEvents(eventIds)

    if (events.length !== eventIds.length) {
      throw new Error(
        `Could not load some specified events. Expected ${eventIds.length}, got ${events.length} events. Maybe they were cleared from the database, or they weren't saved yet.`
      )
    }

    return buildScenarioFromEvents(events)
  }

  async saveScenario(name: string, scenario: Scenario): Promise<void> {
    await Instance.upsertFile(path.join(SCENARIO_FOLDER, `${name}.json`), JSON.stringify(scenario, undefined, 2))

    await this._loadScenarios()
  }

  async deleteScenario(name: string): Promise<void> {
    const filePath = path.join(SCENARIO_FOLDER, `${name}.json`)
    const exists = await Instance.fileExists(filePath)

    if (!exists) {
      return
    }

    await Instance.deleteFile(filePath)
    await this._loadScenarios()
  }

  async deleteAllScenarios(): Promise<void[]> {
    const scenarios = await this.getScenarios()

    return Promise.all(
      scenarios.map(async (scenario) => {
        await this.deleteScenario(scenario.name!)
      })
    )
  }

  async executeSingle(liteScenario: Partial<Scenario>): Promise<void> {
    await this._ensureHooksEnabled()
    this._runner.startReplay()

    const scenario: Scenario = await Instance.readFile(path.join(SCENARIO_FOLDER, `${liteScenario.name}.json`)).then(
      (buf) => JSON.parse(buf.toString())
    )

    return this._executeScenario({ ...liteScenario, ...scenario })
  }

  async executeAll(): Promise<void> {
    await this._ensureHooksEnabled()
    const scenarios = await this._loadScenarios()
    this._runner.startReplay()

    for (const scenario of scenarios) {
      this._executeScenario(scenario)
    }
  }

  async fetchPreviews(elementIds: string[]): Promise<Preview[]> {
    // TODO: This should probably be a call to the runtime
    const elements: any[] = []
    /* const elements = await this._cms.getContentElements(
      this._botId,
      elementIds.map((x) => x.replace('#!', ''))
    ) */

    return elements.map((element) => {
      return {
        id: `#!${element.id}`,
        preview: element.previews['en'] // TODO: Use the bot's default language instead of hardcoded english
      }
    })
  }

  private async _ensureHooksEnabled(): Promise<void> {
    if (!this._interval) {
      this._interval = setInterval(this._waitTestCompletion.bind(this), TEST_COMPLETION_TIMEOUT)
    }

    try {
      // TODO: This should be done on the runtime?
      //await Instance.renameFile('/hooks/before_incoming_middleware/testing/', '.00_recorder.js', '00_recorder.js')
      //await Instance.renameFile('/hooks/after_event_processed/testing/', '.00_recorder.js', '00_recorder.js')
    } catch {
      // Silently fail
    }
  }

  private async _waitTestCompletion(): Promise<void> {
    if (!this._runner.isRunning() && !this._recorder.isRecording()) {
      try {
        // TODO: This should be done on the runtime?
        //await Instance.renameFile('/hooks/before_incoming_middleware/testing/', '00_recorder.js', '.00_recorder.js')
        //await Instance.renameFile('/hooks/after_event_processed/testing/', '00_recorder.js', '.00_recorder.js')
      } catch {
        // Silently fail
      }

      this._interval && clearInterval(this._interval)
      this._interval = undefined
    }
  }

  private _executeScenario(scenario: Scenario) {
    const eventDestination: sdk.IO.EventDestination = {
      channel: 'testing',
      botId: this._botId,
      target: `test_${nanoid()}`
    }

    this._runner.runScenario({ ...scenario }, eventDestination)
  }

  private async _loadScenarios(): Promise<Scenario[]> {
    const files = await Instance.directoryListing(SCENARIO_FOLDER, {})

    this._scenarios = []
    for (const file of files) {
      const name = path.basename(file as string, '.json')
      const scenarioSteps = (await Instance.readFile(path.join(SCENARIO_FOLDER, file)).then((buf) =>
        JSON.parse(buf.toString())
      )) as Scenario[]

      this._scenarios.push({ name, ...scenarioSteps })
    }

    return this._scenarios
  }

  private async _findEvents(eventIds: string[]): Promise<sdk.IO.StoredEvent[]> {
    /* return this._database('events')
      .whereIn('incomingEventId', eventIds)
      .andWhere({ direction: 'incoming' })
      .then((rows) =>
        rows.map((storedEvent) => ({
          ...storedEvent,
          event: this._database.json.get(storedEvent.event)
        }))
      ) */

    // TODO: This should most likely be a call to the runtime
    return []
  }
}
