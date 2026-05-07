/**
 * @jest-environment node
 */
import { POST } from '@/app/api/helpdesk/route'

jest.mock('@/lib/deepseek')
import { askHelpdesk } from '@/lib/deepseek'
const mockAskHelpdesk = askHelpdesk as jest.MockedFunction<typeof askHelpdesk>

describe('POST /api/helpdesk', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when message is missing', async () => {
    const res = await POST(new Request('http://localhost:3000/api/helpdesk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }))
    expect(res.status).toBe(400)
  })

  it('returns reply from DeepSeek', async () => {
    mockAskHelpdesk.mockResolvedValue('Untuk muat turun prompt, pergi ke halaman browse.')
    const res = await POST(new Request('http://localhost:3000/api/helpdesk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Macam mana nak muat turun?' }),
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.reply).toBe('Untuk muat turun prompt, pergi ke halaman browse.')
  })
})
