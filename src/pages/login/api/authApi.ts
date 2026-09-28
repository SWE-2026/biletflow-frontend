import { isDemoMode } from '@/shared/config'
import { demoAuthApi } from './demoAuthApi'
import { httpAuthApi } from './httpAuthApi'

export const authApi = isDemoMode ? demoAuthApi : httpAuthApi
