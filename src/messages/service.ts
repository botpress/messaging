import { ScopeableService } from '../base/scopeable'
import { uuid } from '../base/types'
import { ConversationService, ScopedConversationService } from '../conversations/service'
import { DatabaseService } from '../database/service'
import { MessageRepository } from './repo'
import { MessageTable } from './table'
import { Message, MessageDeleteFilters, MessageListFilters } from './types'

export class MessageService extends ScopeableService<ScopedMessageService> {
  private table: MessageTable
  private repo: MessageRepository

  constructor(private db: DatabaseService, private conversationService: ConversationService) {
    super()
    this.table = new MessageTable()
    this.repo = new MessageRepository(this.db, this.table)
  }

  async setup() {
    await this.db.table(this.table.id, this.table.create)
  }

  protected createScope(clientId: string) {
    return new ScopedMessageService(clientId, this.repo, this.conversationService.forClient(clientId))
  }
}

export class ScopedMessageService {
  constructor(
    private clientId: string,
    private repo: MessageRepository,
    private conversations: ScopedConversationService
  ) {}

  public async list(filters: MessageListFilters): Promise<Message[]> {
    return this.repo.list(filters)
  }

  public async delete(filters: MessageDeleteFilters): Promise<number> {
    if (filters.id) {
      const message = await this.repo.get(filters.id)

      if (message) {
        const conversation = (await this.conversations.get(message.conversationId))!
        this.conversations.invalidateMostRecent(conversation.userId)
      }

      return (await this.repo.delete(filters.id)) ? 1 : 0
    } else {
      const conversation = (await this.conversations.get(filters.conversationId!))!
      this.conversations.invalidateMostRecent(conversation.userId)

      return this.repo.deleteAll(filters.conversationId!)
    }
  }

  public async create(conversationId: uuid, payload: any, authorId?: string): Promise<Message> {
    const message = await this.repo.create(conversationId, payload, authorId)
    const conversation = (await this.conversations.get(conversationId))!
    await this.conversations.setAsMostRecent(conversation)
    return message
  }

  public async get(id: uuid): Promise<Message | undefined> {
    return this.repo.get(id)
  }
}
