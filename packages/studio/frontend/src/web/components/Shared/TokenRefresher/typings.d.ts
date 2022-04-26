import { AxiosInstance } from 'axios'

export interface TokenRefresherProps {
  getAxiosClient: () => AxiosInstance
  onRefreshCompleted?: (token) => void
}
