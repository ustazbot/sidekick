/**
 * @jest-environment node
 */
import { POST } from '@/app/api/search/route'

jest.mock('@/lib/deepseek')
import { searchVault } from '@/lib/deepseek'
const mockSearchVault = searchVault as jest.MockedFunction<typeof searchVault>

function makeRequest(query: string) {
  return new Request('http://localhost:3000/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
}

describe('POST /api/search', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when query is missing', async () => {
    const res = await POST(new Request('http://localhost:3000/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }))
    expect(res.status).toBe(400)
  })

  it('returns matched files when DeepSeek returns valid filenames', async () => {
    mockSearchVault.mockResolvedValue(['ATTRACT-REN-v1.txt', 'ATTRACT-SKINCARE-v1.txt'])
    const res = await POST(makeRequest('ejen hartanah'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.files)).toBe(true)
    expect(body.files.length).toBe(2)
    expect(body.files[0].filename).toBe('ATTRACT-REN-v1.txt')
  })

  it('returns empty array when DeepSeek returns no matches', async () => {
    mockSearchVault.mockResolvedValue([])
    const res = await POST(makeRequest('xyz irrelevant query'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.files).toEqual([])
  })
})
