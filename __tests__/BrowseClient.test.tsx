import { render, screen, fireEvent } from '@testing-library/react'
import BrowseClient from '@/components/BrowseClient'
import type { VaultFile } from '@/types'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: jest.fn(() => '/dashboard'),
}))

function makeFile(module: string, niche: string, niche_code: string): VaultFile {
  return {
    filename: `${module}-${niche_code}-v1.txt`,
    filepath: `vault/${module.toLowerCase()}/${module}-${niche_code}-v1.txt`,
    module,
    module_desc: `${module} desc`,
    niche,
    niche_code,
    tier: 'MVP',
    platforms: ['Facebook'],
    language: 'Dwibahasa',
    version: 'v1',
    tags: [niche_code.toLowerCase()],
    status: 'ready',
  }
}

const mockFiles: VaultFile[] = [
  makeFile('ATTRACT', 'Niche A', 'REN'),
  makeFile('ATTRACT', 'Niche B', 'SKINCARE'),
  makeFile('CAPTURE', 'Niche A', 'REN'),
]

describe('BrowseClient', () => {
  it('renders all files when activeModule is ALL', () => {
    render(<BrowseClient files={mockFiles} userName="Ahmad" />)
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(3)
  })

  it('filters to only ATTRACT files when ATTRACT pill is clicked', () => {
    render(<BrowseClient files={mockFiles} userName="Ahmad" />)
    fireEvent.click(screen.getByText('Buat Konten'))
    // Only 2 ATTRACT files should be visible; the CAPTURE one should not render
    const cards = screen.getAllByText('ATTRACT')
    expect(cards.length).toBe(2)
    expect(screen.queryByText('CAPTURE')).not.toBeInTheDocument()
  })

  it('shows all files again when Semua pill is clicked after filter', () => {
    render(<BrowseClient files={mockFiles} userName="Ahmad" />)
    fireEvent.click(screen.getByText('Buat Konten'))
    fireEvent.click(screen.getByText('Semua'))
    // All 3 files should be visible — look for all 3 module badges
    const attractBadges = screen.getAllByText('ATTRACT')
    const captureBadges = screen.getAllByText('CAPTURE')
    expect(attractBadges.length).toBe(2)
    expect(captureBadges.length).toBe(1)
  })
})
