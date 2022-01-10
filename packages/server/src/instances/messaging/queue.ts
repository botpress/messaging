export class LinkedQueue<T> {
  private head: LinkedQueueItem<T> | undefined
  private tail: LinkedQueueItem<T> | undefined
  private _count: number = 0

  public get count() {
    return this._count
  }

  private set count(value: number) {
    this._count = value
  }

  public empty() {
    return this.count === 0
  }

  public enqueue(item: T) {
    const link = { value: item }

    if (this.tail) {
      this.tail.next = link
    }

    if (!this.head) {
      this.head = link
    }

    this.tail = link
    this.count++
  }

  public peek(): T {
    if (!this.head) {
      throw Error('Queue is empty')
    }

    return this.head.value
  }

  public dequeue(): T {
    if (!this.head) {
      throw Error('Queue is empty')
    }

    const link = this.head
    this.head = link.next

    if (this.tail === link) {
      this.tail = undefined
    }

    this.count--

    return link.value
  }
}

interface LinkedQueueItem<T> {
  value: T
  next?: LinkedQueueItem<T>
}
