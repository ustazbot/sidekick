/**
 * @jest-environment node
 */
import { POST } from '@/app/api/profile/update/route'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/supabase/admin')

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockCreateAdminClient = createAdminClient as jest.MockedFunction<typeof createAdminClient>

function makeServerClient(userId: string | null, email = 'user@test.com') {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: userId ? { id: userId, email } : null },
      }),
    },
  }
}

function makeAdminDb(opts: { upsertError?: boolean } = {}) {
  const upsertMock = jest.fn().mockResolvedValue({
    error: opts.upsertError ? { message: 'upsert failed' } : null,
  })
  return { from: jest.fn().mockReturnValue({ upsert: upsertMock }), _upsertMock: upsertMock }
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/profile/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/profile/update', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockCreateClient.mockReturnValue(makeServerClient(null) as any)
    const res = await POST(makeRequest({ full_name: 'Ahmad' }))
    expect(res.status).toBe(401)
  })

  it('upserts with id and email so users with no existing row can save', async () => {
    mockCreateClient.mockReturnValue(makeServerClient('user-1', 'user@test.com') as any)
    const adminDb = makeAdminDb()
    mockCreateAdminClient.mockReturnValue(adminDb as any)

    const res = await POST(makeRequest({ full_name: 'Ahmad Razif' }))
    expect(res.status).toBe(200)

    const upsertArg = adminDb._upsertMock.mock.calls[0][0]
    expect(upsertArg).toHaveProperty('id', 'user-1')
    expect(upsertArg).toHaveProperty('email', 'user@test.com')
    expect(upsertArg).toHaveProperty('name', 'Ahmad Razif')
  })

  it('upserts using column "name" (not full_name)', async () => {
    mockCreateClient.mockReturnValue(makeServerClient('user-1') as any)
    const adminDb = makeAdminDb()
    mockCreateAdminClient.mockReturnValue(adminDb as any)

    const res = await POST(makeRequest({ full_name: 'Ahmad Razif' }))
    expect(res.status).toBe(200)

    const upsertArg = adminDb._upsertMock.mock.calls[0][0]
    expect(upsertArg).toHaveProperty('name', 'Ahmad Razif')
    expect(upsertArg).not.toHaveProperty('full_name')
  })

  it('upserts niche in uppercase', async () => {
    mockCreateClient.mockReturnValue(makeServerClient('user-1') as any)
    const adminDb = makeAdminDb()
    mockCreateAdminClient.mockReturnValue(adminDb as any)

    const res = await POST(makeRequest({ niche: 'skincare' }))
    expect(res.status).toBe(200)

    const upsertArg = adminDb._upsertMock.mock.calls[0][0]
    expect(upsertArg).toHaveProperty('niche', 'SKINCARE')
  })

  it('returns 400 for invalid niche', async () => {
    mockCreateClient.mockReturnValue(makeServerClient('user-1') as any)
    const res = await POST(makeRequest({ niche: 'INVALID' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('niche_invalid')
  })

  it('returns 400 when nothing to update', async () => {
    mockCreateClient.mockReturnValue(makeServerClient('user-1') as any)
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('nothing_to_update')
  })

  it('returns 500 when database upsert fails', async () => {
    mockCreateClient.mockReturnValue(makeServerClient('user-1') as any)
    mockCreateAdminClient.mockReturnValue(makeAdminDb({ upsertError: true }) as any)
    const res = await POST(makeRequest({ full_name: 'Ahmad' }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('update_failed')
  })
})
