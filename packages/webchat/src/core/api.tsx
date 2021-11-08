import { Message } from '@botpress/messaging-socket'
import { AxiosInstance, AxiosRequestConfig } from 'axios'
import get from 'lodash/get'
import uuidgen from 'uuid'
import { EventFeedback, uuid } from '../typings'
import BpSocket from './socket'

export default class WebchatApi {
  private axios!: AxiosInstance
  private axiosConfig!: AxiosRequestConfig
  private userId!: string

  constructor(private socket: BpSocket) {}

  private get baseUserPayload() {
    return {
      webSessionId: window.__BP_VISITOR_SOCKET_ID
    }
  }

  async fetchBotInfo() {
    try {
      const { data } = await this.axios.get('/botInfo', this.axiosConfig)
      return data
    } catch (err) {
      console.error('Error while loading bot info', err)
    }
  }

  async fetchPreferences() {
    try {
      const { data } = await this.axios.post('/preferences/get', this.baseUserPayload, this.axiosConfig)
      return data
    } catch (err) {
      console.error('Error while fetching preferences', err)
    }
  }

  async updateUserPreferredLanguage(language: string) {
    try {
      await this.axios.post('/preferences', { ...this.baseUserPayload, language }, this.axiosConfig)
    } catch (err) {
      console.error('Error in updating user preferred language', err)
    }
  }

  async fetchConversations() {
    try {
      const convos = await this.socket.socket.listConversations()
      return convos
    } catch (err) {
      console.error('Error while fetching convos', err)
    }
  }

  async fetchConversation(conversationId: uuid) {
    try {
      const conversation = await this.socket.socket.getConversation(conversationId)
      this.socket.socket.switchConversation(conversation!.id)
      const messages = await this.socket.socket.listMessages()
      return { ...conversation, messages }
    } catch (err) {
      await this.handleApiError(err)
    }
  }

  async resetSession(conversationId: uuid): Promise<void> {
    try {
      await this.axios.post('/conversations/reset', { ...this.baseUserPayload, conversationId }, this.axiosConfig)
    } catch (err) {
      console.error('Error while resetting conversation', err)
    }
  }

  async createConversation(): Promise<uuid | undefined> {
    try {
      const conversation = await this.socket.socket.createConversation()
      return conversation.id
    } catch (err) {
      console.error('Error in create conversation', err)
    }
  }

  async downloadConversation(conversationId: uuid): Promise<any> {
    try {
      const { data } = await this.axios.post(
        '/conversations/download/txt',
        { ...this.baseUserPayload, conversationId },
        this.axiosConfig
      )
      return { name: data.name, txt: data.txt }
    } catch (err) {
      console.error('Error in download conversation', err)
    }
  }

  // TODO: we don't have a /events route available for this
  /*
  async sendEvent(payload: any, conversationId: uuid): Promise<void> {
    try {
      return this.axios.post('/events', { ...this.baseUserPayload, conversationId, payload }, this.axiosConfig)
    } catch (err) {
      await this.handleApiError(err)
    }
  }
  */

  async sendMessage(payload: any, conversationId: uuid): Promise<Message | undefined> {
    try {
      return this.socket.sendPayload(payload)
    } catch (err) {
      await this.handleApiError(err)
    }
  }

  async deleteMessages(conversationId: uuid) {
    try {
      await this.axios.post(
        '/conversations/messages/delete',
        { ...this.baseUserPayload, conversationId },
        this.axiosConfig
      )
    } catch (err) {
      await this.handleApiError(err)
    }
  }

  async sendFeedback(feedback: number, messageId: uuid): Promise<void> {
    try {
      return this.axios.post('/saveFeedback', { messageId, target: this.userId, feedback }, this.axiosConfig)
    } catch (err) {
      await this.handleApiError(err)
    }
  }

  async getMessageIdsFeedbackInfo(messageIds: uuid[]): Promise<EventFeedback[] | undefined> {
    try {
      const { data } = await this.axios.post('/feedbackInfo', { messageIds, target: this.userId }, this.axiosConfig)
      return data
    } catch (err) {
      await this.handleApiError(err)
    }
  }

  async uploadFile(file: File, payload: string, conversationId: uuid): Promise<void> {
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('webSessionId', this.baseUserPayload.webSessionId)
      data.append('conversationId', conversationId)
      data.append('payload', payload)

      return this.axios.post('/messages/files', data, this.axiosConfig)
    } catch (err) {
      await this.handleApiError(err)
    }
  }

  async sendVoiceMessage(voice: Buffer, ext: string, conversationId: uuid): Promise<void> {
    try {
      const audio = {
        buffer: voice.toString('base64'),
        title: `${uuidgen.v4()}.${ext}`
      }
      return this.axios.post('/messages/voice', { ...this.baseUserPayload, conversationId, audio }, this.axiosConfig)
    } catch (err) {
      await this.handleApiError(err)
    }
  }

  async setReference(reference: string, conversationId: uuid): Promise<void> {
    try {
      return this.axios.post(
        '/conversations/reference',
        { ...this.baseUserPayload, conversationId, reference },
        this.axiosConfig
      )
    } catch (err) {
      await this.handleApiError(err)
    }
  }

  async listByIncomingEvent(messageId: uuid) {
    const { data: messages } = await this.axios.get(`/messaging/list-by-incoming-event/${messageId}`, {
      baseURL: window['BOT_API_PATH']
    })

    return messages
  }

  handleApiError = async (error: any) => {
    // @deprecated 11.9 (replace with proper error management)
    const data = get(error, 'response.data', {})
    if (data && typeof data === 'string' && data.includes('BP_CONV_NOT_FOUND')) {
      console.error('Conversation not found, starting a new one...')
      await this.createConversation()
    }
  }
}
