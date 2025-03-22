import { Student } from './types'

interface ApiResponse<T> {
  data: T
  error: string | null
}

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>()

const createRequestKey = (endpoint: string, params?: Record<string, any>) => {
  return `${endpoint}${params ? JSON.stringify(params) : ''}`
}

const api = {
  _fetch: async <T>(
    endpoint: string,
    options: RequestInit = {},
    params?: Record<string, any>
  ): Promise<T> => {
    const requestKey = createRequestKey(endpoint, params)
    
    // Check if there's already a pending request for this endpoint
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey)!
    }
    
    // Create abort controller for this request
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout
    
    const promise = fetch(endpoint, {
      ...options,
      headers: {
        'Cache-Control': 'no-store',
        ...options.headers,
      },
      signal: controller.signal,
    })
    .then(async (response) => {
      if (!response.ok) {
        throw new ApiError('Request failed', response.status)
      }
      return response.json()
    })
    .finally(() => {
      clearTimeout(timeout)
      pendingRequests.delete(requestKey)
    })
    
    pendingRequests.set(requestKey, promise)
    return promise
  },
  
  students: {
    async getAll(): Promise<Student[]> {
      try {
        return await api._fetch<Student[]>('/api/students')
      } catch (error) {
        console.error('❌ Error fetching students:', error)
        throw error
      }
    },
  },
  
  instruments: {
    async getAll(): Promise<string[]> {
      try {
        return await api._fetch<string[]>('/api/instruments')
      } catch (error) {
        console.error('❌ Error fetching instruments:', error)
        throw error
      }
    },
  },
}

export { api, ApiError } 