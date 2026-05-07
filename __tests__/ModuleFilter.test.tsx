import { render, screen, fireEvent } from '@testing-library/react'
import ModuleFilter from '@/components/ui/ModuleFilter'

describe('ModuleFilter', () => {
  it('renders all 7 pills including Semua', () => {
    render(<ModuleFilter activeModule="ALL" onSelect={jest.fn()} />)
    expect(screen.getByText('Semua')).toBeInTheDocument()
    expect(screen.getByText('Buat Konten')).toBeInTheDocument()
    expect(screen.getByText('Balas Komen')).toBeInTheDocument()
    expect(screen.getByText('Mesej WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Skrip Closing')).toBeInTheDocument()
    expect(screen.getByText('Handle Bantahan')).toBeInTheDocument()
    expect(screen.getByText('Buat Iklan')).toBeInTheDocument()
  })

  it('calls onSelect with the module id when a pill is clicked', () => {
    const mockOnSelect = jest.fn()
    render(<ModuleFilter activeModule="ALL" onSelect={mockOnSelect} />)
    fireEvent.click(screen.getByText('Buat Konten'))
    expect(mockOnSelect).toHaveBeenCalledWith('ATTRACT')
  })
})
