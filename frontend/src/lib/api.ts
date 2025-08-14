import { useAuth } from '@clerk/clerk-react'
import type { UserProfile, Persona, Parcel, TrainingSession } from '@/types'

const API_BASE_URL = 'http://localhost:3000/api'

// Re-export types for convenience
export type { UserProfile, Persona, Parcel, TrainingSession }

// API Client class
class ApiClient {
  private baseURL: string
  private getToken: () => Promise<string | null>

  constructor(baseURL: string, getToken: () => Promise<string | null>) {
    this.baseURL = baseURL
    this.getToken = getToken
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken()
    if (!token) {
      throw new Error('No authentication token available')
    }

    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Hook to create API client instance
export const useApiClient = () => {
  const { getToken } = useAuth()
  return new ApiClient(API_BASE_URL, getToken)
}

