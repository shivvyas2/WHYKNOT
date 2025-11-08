// Mock authentication for development
// This bypasses Supabase and creates a mock user session

export interface MockUser {
  id: string
  email: string
  role: 'business' | 'user'
}

export const MOCK_USERS: Record<string, MockUser> = {
  business: {
    id: 'mock-business-user-id',
    email: 'business@whyknot.com',
    role: 'business',
  },
  user: {
    id: 'mock-user-id',
    email: 'user@whyknot.com',
    role: 'user',
  },
}

export function getMockUser(role: 'business' | 'user' = 'user'): MockUser {
  return MOCK_USERS[role]
}

