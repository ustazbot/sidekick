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
    it('redirects /dashboard to /login', async () => {
      const req = makeRequest('/dashboard')
      mockCreateClient.mockResolvedValue(mockClient(req, null) as any)
      const res = await middleware(req)
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('http://localhost:3000/login')
    })

    it('redirects /dashboard/browse to /login', async () => {
      const req = makeRequest('/dashboard/browse')
      mockCreateClient.mockResolvedValue(mockClient(req, null) as any)
      const res = await middleware(req)
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('http://localhost:3000/login')
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

  describe('admin routes', () => {
    it('redirects unauthenticated user from /admin to /login', async () => {
      const req = makeRequest('/admin')
      mockCreateClient.mockResolvedValue(mockClient(req, null) as any)
      const res = await middleware(req)
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('http://localhost:3000/login')
    })

    it('redirects unauthenticated user from /admin/users to /login', async () => {
      const req = makeRequest('/admin/users')
      mockCreateClient.mockResolvedValue(mockClient(req, null) as any)
      const res = await middleware(req)
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('http://localhost:3000/login')
    })

    it('redirects non-admin user from /admin to /dashboard', async () => {
      const req = makeRequest('/admin')
      const regularUser = { id: 'user-123', email: 'user@test.com', app_metadata: {} }
      mockCreateClient.mockResolvedValue(mockClient(req, regularUser) as any)
      const res = await middleware(req)
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard')
    })

    it('redirects user with null app_metadata from /admin to /dashboard', async () => {
      const req = makeRequest('/admin')
      const userWithNullMeta = { id: 'user-123', email: 'user@test.com', app_metadata: null }
      mockCreateClient.mockResolvedValue(mockClient(req, userWithNullMeta) as any)
      const res = await middleware(req)
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard')
    })

    it('allows admin user through to /admin', async () => {
      const req = makeRequest('/admin')
      const adminUser = { id: 'admin-123', email: 'planetrizq@gmail.com', app_metadata: {} }
      const clientResult = mockClient(req, adminUser)
      mockCreateClient.mockResolvedValue(clientResult as any)
      const res = await middleware(req)
      expect(res.headers.get('location')).toBeNull()
      expect(res).toBe(clientResult.supabaseResponse)
    })

    it('allows admin user through to /admin/users', async () => {
      const req = makeRequest('/admin/users')
      const adminUser = { id: 'admin-123', email: 'planetrizq@gmail.com', app_metadata: {} }
      const clientResult = mockClient(req, adminUser)
      mockCreateClient.mockResolvedValue(clientResult as any)
      const res = await middleware(req)
      expect(res.headers.get('location')).toBeNull()
      expect(res).toBe(clientResult.supabaseResponse)
    })
  })

  describe('onboarding routes', () => {
    it('redirects unauthenticated user from /onboarding to /login', async () => {
      const req = makeRequest('/onboarding')
      mockCreateClient.mockResolvedValue(mockClient(req, null) as any)
      const res = await middleware(req)
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('http://localhost:3000/login')
    })

    it('allows authenticated user through to /onboarding', async () => {
      const req = makeRequest('/onboarding')
      const user = { id: 'user-123', email: 'user@test.com', app_metadata: {} }
      const clientResult = mockClient(req, user)
      mockCreateClient.mockResolvedValue(clientResult as any)
      const res = await middleware(req)
      expect(res.headers.get('location')).toBeNull()
      expect(res).toBe(clientResult.supabaseResponse)
    })
  })
})
