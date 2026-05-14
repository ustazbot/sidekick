/**
 * @jest-environment node
 */
import { POST } from '@/app/api/affiliate/register/route'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/supabase/admin')

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockCreateAdminClient = createAdminClient as jest.MockedFunction<typeof createAdminClient>

function makeServerClient(userId: string | null, email = 'testuser@example.com') {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: userId ? { id: userId, email } : null },
      }),
    },
  }
}

function makeAdminClient(options: {
  existing?: { id: string; affiliate_code: string } | null
  codeTaken?: boolean
  insertError?: boolean
} = {}) {
  const maybeSingleExisting = jest.fn().mockResolvedValue({ data: options.existing ?? null, error: null })
  const maybeSingleTaken = jest.fn().mockResolvedValue({
    data: options.codeTaken ? { id: 'taken-id' } : null,
    error: null,
  })
  const insertMock = jest.fn().mockResolvedValue({
    error: options.insertError ? { code: '23506', message: 'insert failed' } : null,
  })

  let callCount = 0

  return {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: callCount++ === 0 ? maybeSingleExisting : maybeSingleTaken,
        }),
      }),
      insert: insertMock,
    })),
    _insertMock: insertMock,
  }
}

describe('POST /api/affiliate/register', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when user is not authenticated', async () => {
    mockCreateClient.mockReturnValue(makeServerClient(null) as any)
    const res = await POST(new Request('http://localhost/api/affiliate/register', { method: 'POST' }))
    expect(res.status).toBe(401)
  })

  it('returns 409 when affiliate already exists', async () => {
    mockCreateClient.mockReturnValue(makeServerClient('u1') as any)
    mockCreateAdminClient.mockReturnValue(
      makeAdminClient({ existing: { id: 'aff-1', affiliate_code: 'existingref' } }) as any
    )
    const res = await POST(new Request('http://localhost/api/affiliate/register', { method: 'POST' }))
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.ref_code).toBe('existingref')
  })

  it('creates affiliate and returns 201 with ref_code', async () => {
    mockCreateClient.mockReturnValue(makeServerClient('u1', 'testuser@example.com') as any)

    // Two sequential maybySingle calls: first returns null (not existing), second returns null (code not taken)
    const maybySingle1 = jest.fn().mockResolvedValue({ data: null, error: null })
    const maybySingle2 = jest.fn().mockResolvedValue({ data: null, error: null })
    const insertMock = jest.fn().mockResolvedValue({ error: null })
    let callCount = 0
    const adminClient = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: callCount++ === 0 ? maybySingle1 : maybySingle2,
          }),
        }),
        insert: insertMock,
      })),
    }
    mockCreateAdminClient.mockReturnValue(adminClient as any)

    const res = await POST(new Request('http://localhost/api/affiliate/register', { method: 'POST' }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.ref_code).toBeDefined()
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'u1' })
    )
  })
})
