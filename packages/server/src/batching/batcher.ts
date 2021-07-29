export class Batcher<T> {
  private batch: T[] = []

  public constructor(
    public id: string,
    private dependencies: Batcher<any>[],
    private onFlush: (batch: T[]) => Promise<void>
  ) {}

  public async push(item: T) {
    this.batch.push(item)

    if (this.batch.length > 40) {
      await this.flush()
    }
  }

  public async flush(depth: number = 0) {
    const padding = ' '.repeat(depth * 4)

    if (depth === 0) {
      console.log()
    }

    console.log(`${padding}${this.id} flush ${this.batch.length}`)

    if (this.batch.length === 0) {
      return
    }

    for (const dep of this.dependencies) {
      console.log(`flushing dependency ${dep.id}`)
      await dep.flush(++depth)
    }

    await this.onFlush(this.batch)
    this.batch = []

    console.log(`${padding}${this.id} done flushing`)

    if (depth === 0) {
      console.log()
    }
  }
}
