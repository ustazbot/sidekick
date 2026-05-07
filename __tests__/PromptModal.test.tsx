import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PromptModal from '@/components/ui/PromptModal'
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

describe('PromptModal', () => {
  it('does not render when isOpen is false', () => {
    render(<PromptModal file={mockFile} isOpen={false} onClose={jest.fn()} />)
    expect(screen.queryByText('ATTRACT')).not.toBeInTheDocument()
  })

  it('renders file info when isOpen is true', () => {
    render(<PromptModal file={mockFile} isOpen={true} onClose={jest.fn()} />)
    expect(screen.getByText('ATTRACT')).toBeInTheDocument()
    expect(screen.getByText(/Real Estate Negotiator/i)).toBeInTheDocument()
    expect(screen.getByText('Content post organik')).toBeInTheDocument()
  })

  it('calls onClose when the overlay background is clicked', () => {
    const mockClose = jest.fn()
    render(<PromptModal file={mockFile} isOpen={true} onClose={mockClose} />)
    fireEvent.click(screen.getByTestId('modal-overlay'))
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it('renders a download link with the correct href', () => {
    render(<PromptModal file={mockFile} isOpen={true} onClose={jest.fn()} />)
    const downloadLink = screen.getByRole('link', { name: /muat turun/i })
    expect(downloadLink).toHaveAttribute('href', '/vault/attract/ATTRACT-REN-v1.txt')
    expect(downloadLink).toHaveAttribute('download', 'ATTRACT-REN-v1.txt')
  })
})
