/**
 * @jest-environment node
 */
import { POST } from '@/app/api/admin/add-user/route'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/supabase/admin')

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockCreateAdminClient = createAdminClient as jest.MockedFunction<typeof createAdminClient>

function makeServerClient(isAdmin: boolean) {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: isAdmin
            ? { id: 'admin-id', email: 'planetrizq@gmail.com' }
            : null,
        },
      }),
    },
  }
}

function makeAdminClient(opts: {
  authError?: { message: string }
  upsertError?: boolean
  purchaseError?: boolean
} = {}) {
  const upsertMock = jest.fn().mockResolvedValue({
    error: opts.upsertError ? { message: 'upsert failed' } : null,
  })
  const insertMock = jest.fn().mockResolvedValue({
    error: opts.purchaseError ? { code: 'ERR', message: 'purchase failed' } : null,
  })
  return {
    auth: {
      admin: {
        createUser: jest.fn().mockResolvedValue({
          data: opts.authError ? null : { user: { id: 'new-user-id' } },
          error: opts.authError ?? null,
        }),
      },
    },
    from: jest.fn((table: string) => {
      if (table === 'users') return { upsert: upsertMock }
      if (table === 'purchases') return { insert: insertMock }
      return {}
    }),
    _upsertMock: upsertMock,
    _insertMock: insertMock,
  }
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/admin/add-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/add-user', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when user is not authenticated', async () => {
    mockCreateClient.mockReturnValue(makeServerClient(false) as any)
    const res = await POST(makeRequest({ email: 'u@test.com', password: 'password123' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when email is missing', async () => {
    mockCreateClient.mockReturnValue(makeServerClient(true) as any)
    mockCreateAdminClient.mockReturnValue(makeAdminClient() as any)
    const res = await POST(makeRequest({ password: 'password123' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('email_and_password_required')
  })

  it('returns 400 when password is too short', async () => {
    mockCreateClient.mockReturnValue(makeServerClient(true) as any)
    mockCreateAdminClient.mockReturnValue(makeAdminClient() as any)
    const res = await POST(makeRequest({ email: 'u@test.com', password: 'short' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('password_too_short')
  })

  it('upserts user row using column "name", not "full_name"', async () => {
    mockCreateClient.mockReturnValue(makeServerClient(true) as any)
    const admin = makeAdminClient()
    mockCreateAdminClient.mockReturnValue(admin as any)

    const res = await POST(makeRequest({ email: 'u@test.com', password: 'password123', full_name: 'Ahmad Bos' }))
    expect(res.status).toBe(201)

    const row = admin._upsertMock.mock.calls[0][0]
    expect(row).toHaveProperty('name', 'Ahmad Bos')
    expect(row).not.toHaveProperty('full_name')
  })

  it('stores niche in uppercase', async () => {
    mockCreateClient.mockReturnValue(makeServerClient(true) as any)
    const admin = makeAdminClient()
    mockCreateAdminClient.mockReturnValue(admin as any)

    await POST(makeRequest({ email: 'u@test.com', password: 'password123', niche: 'skincare' }))

    const row = admin._upsertMock.mock.calls[0][0]
    expect(row).toHaveProperty('niche', 'SKINCARE')
  })

  it('returns 201 with user_id on success', async () => {
    mockCreateClient.mockReturnValue(makeServerClient(true) as any)
    mockCreateAdminClient.mockReturnValue(makeAdminClient() as any)

    const res = await POST(makeRequest({ email: 'u@test.com', password: 'password123' }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.user_id).toBe('new-user-id')
  })

  it('returns 409 when email is already taken', async () => {
    mockCreateClient.mockReturnValue(makeServerClient(true) as any)
    mockCreateAdminClient.mockReturnValue(
      makeAdminClient({ authError: { message: 'User already registered' } }) as any
    )

    const res = await POST(makeRequest({ email: 'taken@test.com', password: 'password123' }))
    expect(res.status).toBe(409)
  })

  it('returns 201 with warning when purchase insert fails', async () => {
    mockCreateClient.mockReturnValue(makeServerClient(true) as any)
    mockCreateAdminClient.mockReturnValue(makeAdminClient({ purchaseError: true }) as any)

    const res = await POST(makeRequest({ email: 'u@test.com', password: 'password123' }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.warning).toBe('access_not_granted')
  })
})
