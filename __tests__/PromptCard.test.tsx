import { render, screen, fireEvent } from '@testing-library/react'
import PromptCard from '@/components/ui/PromptCard'
import type { VaultFile } from '@/types'

const mockFile: VaultFile = {
  filename: 'ATTRACT-REN-v1.txt',
  filepath: 'vault/attract/ATTRACT-REN-v1.txt',
  module: 'ATTRACT',
  module_desc: 'Content post organik',
  niche: 'Real Estate Negotiator (Ejen Hartanah)',
  niche_code: 'REN',
  tier: 'MVP',
  platforms: ['Facebook', 'TikTok'],
  language: 'Dwibahasa',
  version: 'v1',
  tags: ['ren', 'hartanah'],
  status: 'ready',
}

describe('PromptCard', () => {
  it('renders module and niche info', () => {
    render(<PromptCard file={mockFile} onClick={jest.fn()} />)
    expect(screen.getByText('ATTRACT')).toBeInTheDocument()
    expect(screen.getByText(/Real Estate Negotiator/i)).toBeInTheDocument()
  })

  it('calls onClick when the card is clicked', () => {
    const mockClick = jest.fn()
    render(<PromptCard file={mockFile} onClick={mockClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockClick).toHaveBeenCalledTimes(1)
  })
})
