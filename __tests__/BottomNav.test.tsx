import { render, screen } from '@testing-library/react'
import BottomNav from '@/components/ui/BottomNav'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))
import { usePathname } from 'next/navigation'
const mockUsePathname = usePathname as jest.Mock

jest.mock('next/link', () => {
  const Link = ({ href, children, ...props }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  )
  Link.displayName = 'Link'
  return Link
})

describe('BottomNav', () => {
  it('renders all 4 navigation tabs', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<BottomNav />)
    expect(screen.getByText('Vault')).toBeInTheDocument()
    expect(screen.getByText('Cari')).toBeInTheDocument()
    expect(screen.getByText('Affiliate')).toBeInTheDocument()
    expect(screen.getByText('Profil')).toBeInTheDocument()
  })

  it('marks the Vault tab active on /dashboard with aria-current', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<BottomNav />)
    const vaultLink = screen.getByRole('link', { name: /vault/i })
    expect(vaultLink).toHaveAttribute('aria-current', 'page')
    const searchLink = screen.getByRole('link', { name: /cari/i })
    expect(searchLink).not.toHaveAttribute('aria-current')
  })
})
