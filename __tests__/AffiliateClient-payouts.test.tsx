import { render, screen } from '@testing-library/react'
import AffiliateClient from '@/components/AffiliateClient'

// Mock fetch untuk handleRegister (tidak digunakan dalam test ini)
global.fetch = jest.fn()

const mockAffiliate = {
  ref_code: 'testref123',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
}

const mockPayouts = [
  {
    id: 'pay-1',
    amount: 76,
    method: 'manual',
    note: 'Bayaran terus',
    paid_at: '2026-05-12T10:00:00Z',
  },
  {
    id: 'pay-2',
    amount: 38,
    method: 'manual',
    note: null,
    paid_at: '2026-04-01T08:00:00Z',
  },
]

describe('AffiliateClient — sejarah bayaran', () => {
  it('menunjukkan "Tiada bayaran komisyen lagi" apabila payouts kosong', () => {
    render(
      <AffiliateClient
        affiliate={mockAffiliate}
        refUrl="https://sidekick.my/ref/testref123"
        payouts={[]}
      />
    )
    expect(screen.getByText('Tiada bayaran komisyen lagi')).toBeInTheDocument()
  })

  it('menunjukkan "Tiada bayaran komisyen lagi" apabila payouts tidak dihantar', () => {
    render(
      <AffiliateClient
        affiliate={mockAffiliate}
        refUrl="https://sidekick.my/ref/testref123"
      />
    )
    expect(screen.getByText('Tiada bayaran komisyen lagi')).toBeInTheDocument()
  })

  it('menunjukkan senarai rekod bayaran apabila payouts ada data', () => {
    render(
      <AffiliateClient
        affiliate={mockAffiliate}
        refUrl="https://sidekick.my/ref/testref123"
        payouts={mockPayouts}
      />
    )
    expect(screen.getByText('RM76.00')).toBeInTheDocument()
    expect(screen.getByText('RM38.00')).toBeInTheDocument()
  })

  it('menunjukkan heading "Sejarah Bayaran Komisyen" apabila affiliate ada', () => {
    render(
      <AffiliateClient
        affiliate={mockAffiliate}
        refUrl="https://sidekick.my/ref/testref123"
        payouts={[]}
      />
    )
    expect(screen.getByText('Sejarah Bayaran Komisyen')).toBeInTheDocument()
  })

  it('tidak menunjukkan segmen sejarah apabila tiada affiliate', () => {
    render(
      <AffiliateClient
        affiliate={null}
        refUrl={null}
        payouts={[]}
      />
    )
    expect(screen.queryByText('Sejarah Bayaran Komisyen')).not.toBeInTheDocument()
  })

  it('menunjukkan "—" untuk tarikh yang tidak sah', () => {
    render(
      <AffiliateClient
        affiliate={mockAffiliate}
        refUrl="https://sidekick.my/ref/testref123"
        payouts={[{ id: 'pay-bad', amount: 50, method: 'manual', note: null, paid_at: 'not-a-date' }]}
      />
    )
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })
})
