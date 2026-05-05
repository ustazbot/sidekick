/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '../middleware'

jest.mock('@/lib/supabase/middleware')
import { createClient } from '@/lib/supabase/middleware'
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

function makeRequest(pathname: string): NextRequest {
  return new NextRequest(new URL(`http://localhost:3000${pathname}`))
}

function mockClient(request: NextRequest, user: object | null) {
  return {
    supabase: {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
    },
    supabaseResponse: NextResponse.next({ request }),
  }
}

describe('middleware', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('unauthenticated user', () => {
    it('redirects /dashboard to /', async () => {
      const req = makeRequest('/dashboard')
      mockCreateClient.mockResolvedValue(mockClient(req, null) as any)
      const res = await middleware(req)
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('http://localhost:3000/')
    })

    it('redirects /dashboard/browse to /', async () => {
      const req = makeRequest('/dashboard/browse')
      mockCreateClient.mockResolvedValue(mockClient(req, null) as any)
      const res = await middleware(req)
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('http://localhost:3000/')
    })

    it('passes /login through without redirect', async () => {
      const req = makeRequest('/login')
      const clientResult = mockClient(req, null)
      mockCreateClient.mockResolvedValue(clientResult as any)
      const res = await middleware(req)
      expect(res.headers.get('location')).toBeNull()
      expect(res).toBe(clientResult.supabaseResponse)
    })
  })

  describe('authenticated user', () => {
    const mockUser = { id: 'user-123', email: 'user@test.com' }

    it('redirects /login to /dashboard', async () => {
      const req = makeRequest('/login')
      mockCreateClient.mockResolvedValue(mockClient(req, mockUser) as any)
      const res = await middleware(req)
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard')
    })

    it('passes /dashboard through without redirect', async () => {
      const req = makeRequest('/dashboard')
      const clientResult = mockClient(req, mockUser)
      mockCreateClient.mockResolvedValue(clientResult as any)
      const res = await middleware(req)
      expect(res.headers.get('location')).toBeNull()
      expect(res).toBe(clientResult.supabaseResponse)
    })
  })
})
