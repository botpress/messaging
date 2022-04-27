import { StoredToken, TokenResponse } from '@botpress/common'
import { AxiosInstance } from 'axios'


export interface UserAuth {
  getToken: (onlyToken?: boolean) => StoredToken | string | undefined
  setToken: (token: Partial<TokenResponse>) => void
  setVisitorId: (userId: string, userIdScope?: string) => void
  getUniqueVisitorId: (userIdScope?: string) => string
  isTokenValid: () => boolean
  logout: (getAxiosClient: () => AxiosInstance) => void
}
