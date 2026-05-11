/**
 * @jest-environment node
 */
import { POST } from '@/app/api/admin/affiliate/payout/route'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/supabase/admin')

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockCreateAdminClient = createAdminClient as jest.MockedFunction<typeof createAdminClient>

function makeAuthSupabase(email: string | null) {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: email ? { id: 'uid', email } : null },
      }),
    },
  }
}

function makeAdminDb(opts: {
  affiliate?: { id: string; pending_commission: number; total_withdrawn: number; total_commission: number } | null
  updateError?: boolean
  insertPayoutError?: boolean
}) {
  const insertPayoutMock = jest.fn().mockResolvedValue({
    error: opts.insertPayoutError ? { message: 'insert failed' } : null,
  })
  const updateConvEq2 = jest.fn().mockResolvedValue({ error: null })
  const updateConvEq1 = jest.fn().mockReturnValue({ eq: updateConvEq2 })
  const updateConvMock = jest.fn().mockReturnValue({ eq: updateConvEq1 })
  const updateAffEq = jest.fn().mockResolvedValue({
    error: opts.updateError ? { message: 'update failed' } : null,
  })
  const updateAffMock = jest.fn().mockReturnValue({ eq: updateAffEq })
  const maybeSingleMock = jest.fn().mockResolvedValue({
    data: opts.affiliate !== undefined ? opts.affiliate : null,
    error: opts.affiliate === undefined ? { message: 'not found' } : null,
  })
  const selectEqMock = jest.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
  const selectMock = jest.fn().mockReturnValue({ eq: selectEqMock })

  return {
    from: jest.fn((table: string) => {
      if (table === 'affiliates') return { select: selectMock, update: updateAffMock }
      if (table === 'affiliate_conversions') return { update: updateConvMock }
      if (table === 'affiliate_payouts') return { insert: insertPayoutMock }
      return {}
    }),
    _insertPayoutMock: insertPayoutMock,
  }
}

describe('POST /api/admin/affiliate/payout', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 for non-admin user', async () => {
    mockCreateClient.mockReturnValue(makeAuthSupabase('hacker@evil.com') as any)
    mockCreateAdminClient.mockReturnValue(makeAdminDb({}) as any)
    const req = new Request('http://localhost/api/admin/affiliate/payout', {
      method: 'POST',
      body: JSON.stringify({ affiliate_id: 'aff-1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when affiliate_id missing', async () => {
    mockCreateClient.mockReturnValue(makeAuthSupabase('planetrizq@gmail.com') as any)
    mockCreateAdminClient.mockReturnValue(makeAdminDb({}) as any)
    const req = new Request('http://localhost/api/admin/affiliate/payout', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('affiliate_id_required')
  })

  it('returns 404 when affiliate not found', async () => {
    mockCreateClient.mockReturnValue(makeAuthSupabase('planetrizq@gmail.com') as any)
    const db = makeAdminDb({ affiliate: null })
    mockCreateAdminClient.mockReturnValue(db as any)
    const req = new Request('http://localhost/api/admin/affiliate/payout', {
      method: 'POST',
      body: JSON.stringify({ affiliate_id: 'nonexistent' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it('returns 400 when pending commission is 0', async () => {
    mockCreateClient.mockReturnValue(makeAuthSupabase('planetrizq@gmail.com') as any)
    const db = makeAdminDb({
      affiliate: { id: 'aff-1', pending_commission: 0, total_withdrawn: 0, total_commission: 0 },
    })
    mockCreateAdminClient.mockReturnValue(db as any)
    const req = new Request('http://localhost/api/admin/affiliate/payout', {
      method: 'POST',
      body: JSON.stringify({ affiliate_id: 'aff-1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('no_pending')
  })

  it('returns 200 and inserts payout log on success', async () => {
    mockCreateClient.mockReturnValue(makeAuthSupabase('planetrizq@gmail.com') as any)
    const db = makeAdminDb({
      affiliate: { id: 'aff-1', pending_commission: 76, total_withdrawn: 0, total_commission: 76 },
    })
    mockCreateAdminClient.mockReturnValue(db as any)
    const req = new Request('http://localhost/api/admin/affiliate/payout', {
      method: 'POST',
      body: JSON.stringify({ affiliate_id: 'aff-1', method: 'manual', note: 'Bayaran terus' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.amount_paid).toBe(76)
    expect(db._insertPayoutMock).toHaveBeenCalledWith({
      affiliate_id: 'aff-1',
      amount: 76,
      method: 'manual',
      note: 'Bayaran terus',
    })
  })

  it('still returns 200 even when payout log insert fails', async () => {
    mockCreateClient.mockReturnValue(makeAuthSupabase('planetrizq@gmail.com') as any)
    const db = makeAdminDb({
      affiliate: { id: 'aff-1', pending_commission: 38, total_withdrawn: 0, total_commission: 38 },
      insertPayoutError: true,
    })
    mockCreateAdminClient.mockReturnValue(db as any)
    const req = new Request('http://localhost/api/admin/affiliate/payout', {
      method: 'POST',
      body: JSON.stringify({ affiliate_id: 'aff-1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
