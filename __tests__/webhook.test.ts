/**
 * @jest-environment node
 */
import { POST } from '@/app/api/webhook/toyyibpay/route'

jest.mock('@/lib/supabase/admin')
import { createAdminClient } from '@/lib/supabase/admin'
const mockCreateAdminClient = createAdminClient as jest.MockedFunction<typeof createAdminClient>

function makeRequest(fields: Record<string, string>) {
  const body = new URLSearchParams(fields).toString()
  return new Request('http://localhost:3000/api/webhook/toyyibpay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
}

function makeAdminClient(options: { inviteError?: boolean; insertError?: boolean }) {
  const insertMock = jest.fn().mockResolvedValue({
    error: options.insertError ? { message: 'insert failed' } : null,
  })
  const fromMock = jest.fn().mockReturnValue({ insert: insertMock })
  const inviteMock = jest.fn().mockResolvedValue({
    data: options.inviteError ? null : { user: { id: 'new-user-id' } },
    error: options.inviteError ? { message: 'already registered' } : null,
  })
  return {
    auth: { admin: { inviteUserByEmail: inviteMock } },
    from: fromMock,
  }
}

describe('POST /api/webhook/toyyibpay', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 with received:true for pending payment (status 2) without processing', async () => {
    const req = makeRequest({
      billCode: 'BILL123',
      billpaymentStatus: '2',
      billExternalReferenceNo: 'buyer@test.com',
      billpaymentAmount: '97.00',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.received).toBe(true)
    expect(mockCreateAdminClient).not.toHaveBeenCalled()
  })

  it('invites user and creates purchase for successful payment (status 1)', async () => {
    const adminClient = makeAdminClient({})
    mockCreateAdminClient.mockReturnValue(adminClient as any)
    const req = makeRequest({
      billCode: 'BILL123',
      billpaymentStatus: '1',
      billExternalReferenceNo: 'buyer@test.com',
      billpaymentAmount: '97.00',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(adminClient.auth.admin.inviteUserByEmail).toHaveBeenCalledWith(
      'buyer@test.com',
      expect.objectContaining({ redirectTo: expect.stringContaining('/auth/callback') })
    )
    expect(adminClient.from).toHaveBeenCalledWith('purchases')
    expect(adminClient.from('purchases').insert).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'buyer@test.com',
        amount: 97,
        toyyibpay_ref: 'BILL123',
        status: 'success',
      })
    )
  })

  it('returns 400 when email is missing', async () => {
    const req = makeRequest({
      billCode: 'BILL123',
      billpaymentStatus: '1',
      billExternalReferenceNo: '',
      billpaymentAmount: '97.00',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 even when purchase insert fails (prevent ToyyibPay retries)', async () => {
    const adminClient = makeAdminClient({ insertError: true })
    mockCreateAdminClient.mockReturnValue(adminClient as any)
    const req = makeRequest({
      billCode: 'BILL123',
      billpaymentStatus: '1',
      billExternalReferenceNo: 'buyer@test.com',
      billpaymentAmount: '97.00',
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
