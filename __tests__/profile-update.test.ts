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

function makeServerClient(userId: string | null) {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: userId ? { id: userId } : null },
      }),
    },
  }
}

function makeAdminDb(opts: { updateError?: boolean } = {}) {
  const updateMock = jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({
      error: opts.updateError ? { message: 'column full_name does not exist' } : null,
    }),
  })
  return { from: jest.fn().mockReturnValue({ update: updateMock }) }
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

  it('updates using column "name" (not full_name)', async () => {
    mockCreateClient.mockReturnValue(makeServerClient('user-1') as any)
    const adminDb = makeAdminDb()
    mockCreateAdminClient.mockReturnValue(adminDb as any)

    const res = await POST(makeRequest({ full_name: 'Ahmad Razif' }))
    expect(res.status).toBe(200)

    const updateArg = adminDb.from('users').update.mock.calls[0][0]
    expect(updateArg).toHaveProperty('name', 'Ahmad Razif')
    expect(updateArg).not.toHaveProperty('full_name')
  })

  it('updates niche correctly', async () => {
    mockCreateClient.mockReturnValue(makeServerClient('user-1') as any)
    const adminDb = makeAdminDb()
    mockCreateAdminClient.mockReturnValue(adminDb as any)

    const res = await POST(makeRequest({ niche: 'skincare' }))
    expect(res.status).toBe(200)

    const updateArg = adminDb.from('users').update.mock.calls[0][0]
    expect(updateArg).toHaveProperty('niche', 'SKINCARE')
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

  it('returns 500 when database update fails', async () => {
    mockCreateClient.mockReturnValue(makeServerClient('user-1') as any)
    mockCreateAdminClient.mockReturnValue(makeAdminDb({ updateError: true }) as any)
    const res = await POST(makeRequest({ full_name: 'Ahmad' }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('update_failed')
  })
})
