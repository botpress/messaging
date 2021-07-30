export abstract class Batcher<T> {
  constructor(public id: string) {}

  public abstract push(item: T): Promise<void>
  public abstract flush(): Promise<void>
}

export class ImmediateBatcher<T> extends Batcher<T> {
  public constructor(id: string, private onFlush: (batch: T[]) => Promise<void>) {
    super(id)
  }

  public async push(item: T) {
    await this.onFlush([item])
  }

  public async flush() {}
}

export class DelayedBatcher<T> extends Batcher<T> {
  private batch: T[] = []

  public constructor(
    id: string,
    private dependencies: Batcher<any>[],
    private maxSize: number,
    private onFlush: (batch: T[]) => Promise<void>
  ) {
    super(id)
  }

  public async push(item: T) {
    if (this.batch.length + 1 > this.maxSize) {
      await this.flush()
    }

    this.batch.push(item)
  }

  public async flush() {
    for (const dep of this.dependencies) {
      await dep.flush()
    }

    if (this.batch.length === 0) {
      return
    }

    const outBatch = this.batch
    this.batch = []
    await this.onFlush(outBatch)
  }
}
