export class Batcher<T> {
  private batch: T[] = []

  public constructor(
    public id: string,
    private dependencies: Batcher<any>[],
    private maxSize: number,
    private onFlush: (batch: T[]) => Promise<void>
  ) {}

  public async push(item: T) {
    this.batch.push(item)

    if (this.batch.length > this.maxSize) {
      await this.flush()
    }
  }

  public async flush() {
    if (this.batch.length === 0) {
      return
    }

    for (const dep of this.dependencies) {
      await dep.flush()
    }

    await this.onFlush(this.batch)
    this.batch = []
  }
}
