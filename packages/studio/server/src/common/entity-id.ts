export const getEntityId = (entityName: string) =>
  entityName
    .trim()
    .toLowerCase()
    .replace(/[\t\s]/g, '-')
