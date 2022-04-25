import { Inspector } from './database'

export const compareDatabases = async (db1: string, db2: string) => {
  const db1Inspector = new Inspector(db1)
  const db2Inspector = new Inspector(db2)

  try {
    const db1Tables = await db1Inspector.tables()
    const db2Tables = await db2Inspector.tables()

    for (const table of db1Tables) {
      const db1TableColumns = (await db1Inspector.columns(table.name))!
      const db2TableColumns = await db2Inspector.columns(table.name)

      if (!db2TableColumns) {
        throw new Error(`Table '${table.name}' is missing in the database where we ran all migrations.`)
      }

      for (const { table, column } of db1TableColumns) {
        const db1TableColumnInfo = await db1Inspector.columnInfo(table, column)
        const db2TableColumnInfo = await db2Inspector.columnInfo(table, column)

        if (!db2TableColumnInfo) {
          throw new Error(
            `Column '${column}' of table '${table}' is missing in the database where we ran all migrations.`
          )
        }

        expect(db1TableColumnInfo).toEqual(db2TableColumnInfo)
      }

      if (db1TableColumns.length !== db2TableColumns.length) {
        const difference = db2TableColumns.filter((x) => !db1TableColumns.some((c) => c.column.includes(x.column)))

        throw new Error(
          `The DB on which we ran the migrations contains more columns than the other DB. ${difference
            .map((c) => `Table: ${c.table}; Column ${c.column}`)
            .join(', ')}.`
        )
      }
    }

    if (db1Tables.length !== db2Tables.length) {
      const difference = db2Tables.filter((x) => !db1Tables.some((t) => t.name.includes(x.name)))

      throw new Error(
        `The DB on which we ran the migrations contains more tables than the other DB. Tables: ${difference
          .map((t) => t.name)
          .join(', ')}.`
      )
    }
  } finally {
    await db1Inspector.destroy()
    await db2Inspector.destroy()
  }
}
