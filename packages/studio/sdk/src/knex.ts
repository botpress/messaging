import knex from 'knex'

type OriginalDate = Date

declare module 'knex' {
  interface QueryBuilder {
    // get(index?: number): ChainableInterface
  }

  type ColumnOrDate = string | OriginalDate | knex.Sql

  interface Date {
    set(date?: OriginalDate): any
    get(date: any): OriginalDate

    format(exp: any): knex.Raw
    now(): knex.Raw
    today(): knex.Raw
    isBefore(d1: ColumnOrDate, d2: ColumnOrDate): knex.Raw
    isBeforeOrOn(d1: ColumnOrDate, d2: ColumnOrDate): knex.Raw
    isAfter(d1: ColumnOrDate, d2: ColumnOrDate): knex.Raw
    isAfterOrOn(d1: ColumnOrDate, d2: ColumnOrDate): knex.Raw
    isBetween(date: ColumnOrDate, betweenA: ColumnOrDate, betweenB: ColumnOrDate): knex.Raw
    isSameDay(d1: ColumnOrDate, d2: ColumnOrDate): knex.Raw
    hourOfDay(date: ColumnOrDate): knex.Raw
  }

  interface Bool {
    true(): any
    false(): any
    parse(value: any): boolean
  }

  interface Json {
    set(obj: any): any
    get(obj: any): any
  }

  interface Binary {
    set(data: string | Buffer): any
  }

  type KnexCallback = (tableBuilder: knex.CreateTableBuilder) => any

  type GetOrCreateResult<T> = Promise<{
    created: boolean
    result: T
  }>
}
