/**
 * @jest-environment node
 */
import { GET } from '@/app/auth/callback/route'

jest.mock('@/lib/supabase/server')
import { createClient } from '@/lib/supabase/server'
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

function makeRequest(code?: string) {
  const url = `http://localhost:3000/auth/callback${code ? `?code=${code}` : ''}`
  return new Request(url)
}

function makeSupabase(options: {
  exchangeError?: boolean
  userId?: string
  onboarded?: boolean
}) {
  const singleMock = jest.fn().mockResolvedValue({
    data: options.onboarded !== undefined ? { onboarded: options.onboarded } : null,
    error: null,
  })
  const eqMock = jest.fn().mockReturnValue({ single: singleMock })
  const selectMock = jest.fn().mockReturnValue({ eq: eqMock })

  return {
    auth: {
      exchangeCodeForSession: jest.fn().mockResolvedValue({
        error: options.exchangeError ? { message: 'invalid code' } : null,
      }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: options.userId ? { id: options.userId } : null },
      }),
    },
    from: jest.fn().mockReturnValue({ select: selectMock }),
  }
}

describe('GET /auth/callback', () => {
  beforeEach(() => jest.clearAllMocks())

  it('redirects to /login?error=missing_code when no code param', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('missing_code')
  })

  it('redirects to /login?error=auth_error when session exchange fails', async () => {
    mockCreateClient.mockReturnValue(makeSupabase({ exchangeError: true }) as any)
    const res = await GET(makeRequest('bad_code'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('auth_error')
  })

  it('redirects to /onboarding when user is not onboarded', async () => {
    mockCreateClient.mockReturnValue(
      makeSupabase({ userId: 'u1', onboarded: false }) as any
    )
    const res = await GET(makeRequest('valid_code'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/onboarding')
  })

  it('redirects to /dashboard when user is already onboarded', async () => {
    mockCreateClient.mockReturnValue(
      makeSupabase({ userId: 'u1', onboarded: true }) as any
    )
    const res = await GET(makeRequest('valid_code'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/dashboard')
  })
})
