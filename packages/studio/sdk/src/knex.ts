import knex from 'knex'

export type ColumnOrDate = string | Date | knex.Sql

export interface KnexDate {
  set(date?: Date): any
  get(date: any): Date

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

export interface KnexBool {
  true(): any
  false(): any
  parse(value: any): boolean
}

export interface KnexJson {
  set(obj: any): any
  get(obj: any): any
}

export interface KnexBinary {
  set(data: string | Buffer): any
}

export type KnexCallback = (tableBuilder: knex.CreateTableBuilder) => any
