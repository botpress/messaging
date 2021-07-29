export class Batcher<T> {
  private batch: T[] = []

  public constructor(
    public id: string,
    private dependencies: Batcher<any>[],
    private maxSize: number,
    private onFlush: (batch: T[]) => Promise<void>
  ) {}

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
