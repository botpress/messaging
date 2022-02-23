import { Message } from '@botpress/messaging-socket'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { RecentConversation } from '..'
import { BotInfo, uuid } from '../typings'
import BpSocket from './socket'

export default class WebchatApi {
  private axios!: AxiosInstance
  private axiosConfig!: AxiosRequestConfig

  constructor(private socket: BpSocket) {}

  async fetchBotInfo(mediaFileServiceUrl: string) {
    try {
      const { data } = await axios.get<BotInfo>(mediaFileServiceUrl)
      return data
    } catch (err) {
      console.error('Error while loading bot info', err)
    }
  }

  async fetchConversations() {
    try {
      const conversations = (await this.socket.socket.listConversations()) as RecentConversation[]

      // Add the last message of each conversation
      for (const conversation of conversations) {
        const limit = 1

        await this.socket.socket.switchConversation(conversation.id)
        const lastMessages = await this.socket.socket.listMessages(limit)

        if (lastMessages.length >= limit) {
          conversation.lastMessage = lastMessages[0]
        }
      }

      return conversations
    } catch (err) {
      console.error('Error while fetching users conversations', err)

      return []
    }
  }

  async fetchConversation(conversationId: uuid) {
    try {
      const conversation = await this.socket.socket.getConversation(conversationId)
      this.socket.socket.switchConversation(conversation!.id)
      const messages = (await this.socket.socket.listMessages()).filter((x) => x.payload.type !== 'visit')
      return { ...conversation, messages }
    } catch (err) {
      console.error('Error fetching a conversation', err)
    }
  }

  // TODO: Fis this
  async resetSession(conversationId: uuid): Promise<void> {
    try {
    } catch (err) {
      console.error('Error while resetting conversation', err)
    }
  }

  async createConversation(): Promise<uuid | undefined> {
    try {
      const conversation = await this.socket.socket.createConversation()
      return conversation.id
    } catch (err) {
      console.error('Error creating conversation', err)
    }
  }

  async startConversation(): Promise<void> {
    try {
      await this.socket.socket.startConversation()
    } catch (err) {
      console.error('Error starting conversation', err)
    }
  }

  async sendMessage(payload: any, conversationId: uuid): Promise<Message | undefined> {
    try {
      return this.socket.sendPayload(payload)
    } catch (err) {
      console.error('Error sending message', err)
    }
  }

  async deleteConversation(conversationId: uuid) {
    try {
      await this.socket.socket.deleteConversation(conversationId)
    } catch (err) {
      console.error('Error deleting conversation', err)
    }
  }

  async sendFeedback(feedback: number, messageId: uuid): Promise<void> {
    return this.socket.socket.sendFeedback(messageId, feedback)
  }

  async uploadFile(file: File, payload: string, conversationId: uuid): Promise<void> {
    const data = new FormData()
    data.append('file', file)
    data.append('conversationId', conversationId)
    data.append('payload', payload)

    return this.axios.post('/messages/files', data, this.axiosConfig)
  }

  // TODO: Fix this
  async sendVoiceMessage(voice: Buffer, ext: string, conversationId: uuid): Promise<void> {
    const audio = {
      buffer: voice.toString('base64'),
      title: `${uuidv4()}.${ext}`
    }
  }
}
