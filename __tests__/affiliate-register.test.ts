/**
 * @jest-environment node
 */
import { POST } from '@/app/api/affiliate/register/route'

jest.mock('@/lib/supabase/server')
import { createClient } from '@/lib/supabase/server'
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

function makeSupabase(options: {
  userId?: string
  email?: string
  insertError?: boolean
  alreadyExists?: boolean
}) {
  const selectSingleMock = jest.fn().mockResolvedValue({
    data: options.alreadyExists ? { id: 'existing-id', ref_code: 'existingref' } : null,
    error: null,
  })
  const eqSelectMock = jest.fn().mockReturnValue({ single: selectSingleMock })
  const selectMock = jest.fn().mockReturnValue({ eq: eqSelectMock })

  const insertMock = jest.fn().mockResolvedValue({
    data: options.insertError ? null : [{ id: 'new-id', ref_code: 'testuser12' }],
    error: options.insertError ? { message: 'insert failed' } : null,
  })

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: options.userId
            ? { id: options.userId, email: options.email ?? 'test@example.com' }
            : null,
        },
      }),
    },
    from: jest.fn((table: string) => {
      if (table === 'affiliates') return { select: selectMock, insert: insertMock }
      return { select: selectMock, insert: insertMock }
    }),
  }
}

describe('POST /api/affiliate/register', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when user is not authenticated', async () => {
    mockCreateClient.mockReturnValue(makeSupabase({}) as any)
    const res = await POST(new Request('http://localhost:3000/api/affiliate/register', { method: 'POST' }))
    expect(res.status).toBe(401)
  })

  it('returns 409 when affiliate already exists', async () => {
    mockCreateClient.mockReturnValue(
      makeSupabase({ userId: 'u1', email: 'test@example.com', alreadyExists: true }) as any
    )
    const res = await POST(new Request('http://localhost:3000/api/affiliate/register', { method: 'POST' }))
    expect(res.status).toBe(409)
  })

  it('creates affiliate record and returns 201 for authenticated user', async () => {
    mockCreateClient.mockReturnValue(
      makeSupabase({ userId: 'u1', email: 'testuser@example.com' }) as any
    )
    const res = await POST(new Request('http://localhost:3000/api/affiliate/register', { method: 'POST' }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.ref_code).toBeDefined()
  })
})
