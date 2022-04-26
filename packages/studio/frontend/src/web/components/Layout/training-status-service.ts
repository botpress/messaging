import axios from 'axios'
import { NLUProgressEvent, Training } from 'common/nlu-training'
import EventBus from '~/util/EventBus'

export class TrainingStatusService {
  constructor(private language: string, private callback: (session: Training) => void) {}

  public fetchTrainingStatus = async () => {
    try {
      const { data: session } = await axios.get(`${window.STUDIO_API_PATH}/nlu/training/${this.language}`)
      this.callback(session)
    } catch (err) {}
  }

  public listen() {
    EventBus.default.on('statusbar.event', this._onStatusBarEvent)
  }

  public stopListening() {
    EventBus.default.off('statusbar.event', this._onStatusBarEvent)
  }

  private _onStatusBarEvent = async (ev) => {
    if (ev.type !== 'nlu') {
      return
    }

    const event: NLUProgressEvent = ev
    if (event.type === 'nlu' && event.botId === window.BOT_ID) {
      this.callback(event)
    }
  }
}
