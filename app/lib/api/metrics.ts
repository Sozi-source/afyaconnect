import api from './client'
import { MetricsResponse } from '@/app/types'

export const metricsApi = {
  // Get dashboard metrics
  getDashboard: async (params?: { start_date?: string; end_date?: string }) => {
    const response = await api.get<MetricsResponse>('/metrics/', { params })
    return response.data
  },
}