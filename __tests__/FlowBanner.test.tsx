import { render, screen, fireEvent } from '@testing-library/react'
import FlowBanner from '@/components/ui/FlowBanner'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = val },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
})

describe('FlowBanner', () => {
  beforeEach(() => localStorageMock.clear())

  it('renders 3 flow steps', () => {
    render(<FlowBanner />)
    expect(screen.getByText('Pilih Modul')).toBeInTheDocument()
    expect(screen.getByText('Muat Turun')).toBeInTheDocument()
    expect(screen.getByText('Guna dengan AI')).toBeInTheDocument()
  })

  it('hides banner after dismiss button is clicked', () => {
    render(<FlowBanner />)
    const dismissBtn = screen.getByRole('button', { name: /tutup/i })
    fireEvent.click(dismissBtn)
    expect(screen.queryByText('Pilih Modul')).not.toBeInTheDocument()
  })

  it('does not render banner when already dismissed in localStorage', () => {
    localStorageMock.setItem('sidekick_banner_dismissed', '1')
    render(<FlowBanner />)
    expect(screen.queryByText('Pilih Modul')).not.toBeInTheDocument()
  })
})
