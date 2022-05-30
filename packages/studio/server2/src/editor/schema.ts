import { ReqSchema } from '@botpress/framework'

const Api = {
  ListFiles: ReqSchema(),
  GetPermissions: ReqSchema(),
  GetTypings: ReqSchema()
}

export const Schema = { Api }
