import { http } from '@/utils/http'

export const testAPI = () => {
  return http.get('/hello')
}
