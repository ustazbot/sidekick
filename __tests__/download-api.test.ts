/**
 * @jest-environment node
 */
import { GET } from '@/app/api/download/route'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/supabase/admin')

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockCreateAdminClient = createAdminClient as jest.MockedFunction<typeof createAdminClient>

function makeRequest(filename: string) {
  return new Request(`http://localhost/api/download?file=${encodeURIComponent(filename)}`)
}

function makeServerClient(user: object | null = { id: 'user-1', email: 'buyer@test.com' }) {
  return {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user }, error: null }) },
  }
}

function makeAdminClient(options: {
  hasPurchase?: boolean
  storageContent?: string
  storageError?: boolean
} = {}) {
  const { hasPurchase = true, storageContent = 'isi prompt ujian', storageError = false } = options

  const downloadMock = jest.fn().mockResolvedValue(
    storageError
      ? { data: null, error: { message: 'storage error' } }
      : { data: new Blob([storageContent]), error: null }
  )

  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    eq:     jest.fn().mockReturnThis(),
    limit:  jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({
      data: hasPurchase ? { id: 'purchase-1' } : null,
      error: null,
    }),
    insert: jest.fn().mockResolvedValue({ error: null }),
  }

  return {
    from: jest.fn(() => queryBuilder),
    storage: { from: jest.fn(() => ({ download: downloadMock })) },
    _downloadMock: downloadMock,
  }
}

describe('GET /api/download', () => {
  beforeEach(() => jest.clearAllMocks())

  it('mengembalikan 400 untuk nama fail tidak sah', async () => {
    mockCreateClient.mockReturnValue(makeServerClient() as any)
    mockCreateAdminClient.mockReturnValue(makeAdminClient() as any)

    const res = await GET(makeRequest('../../etc/passwd'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('invalid_file')
  })

  it('mengembalikan 401 apabila tidak log masuk', async () => {
    mockCreateClient.mockReturnValue(makeServerClient(null) as any)
    mockCreateAdminClient.mockReturnValue(makeAdminClient() as any)

    const res = await GET(makeRequest('ATTRACT-REN-v1.txt'))
    expect(res.status).toBe(401)
  })

  it('mengembalikan 403 apabila tiada pembelian', async () => {
    mockCreateClient.mockReturnValue(makeServerClient() as any)
    mockCreateAdminClient.mockReturnValue(makeAdminClient({ hasPurchase: false }) as any)

    const res = await GET(makeRequest('ATTRACT-REN-v1.txt'))
    expect(res.status).toBe(403)
  })

  it('mengembalikan kandungan fail dari Supabase Storage apabila auth dan pembelian sah', async () => {
    mockCreateClient.mockReturnValue(makeServerClient() as any)
    const adminMock = makeAdminClient({ storageContent: 'isi prompt saya di sini' })
    mockCreateAdminClient.mockReturnValue(adminMock as any)

    const res = await GET(makeRequest('ATTRACT-REN-v1.txt'))
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toBe('isi prompt saya di sini')
    expect(res.headers.get('Content-Disposition')).toContain('ATTRACT-REN-v1.txt')
    // storage dipanggil dengan path tanpa prefix "vault/"
    expect(adminMock._downloadMock).toHaveBeenCalledWith('attract/ATTRACT-REN-v1.txt')
  })

  it('mengembalikan 500 file_read_error apabila Supabase Storage gagal', async () => {
    mockCreateClient.mockReturnValue(makeServerClient() as any)
    mockCreateAdminClient.mockReturnValue(makeAdminClient({ storageError: true }) as any)

    const res = await GET(makeRequest('ATTRACT-REN-v1.txt'))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('file_read_error')
  })
})
