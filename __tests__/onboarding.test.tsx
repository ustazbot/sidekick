import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OnboardingPage from '@/app/onboarding/page'

const mockPush = jest.fn()
const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

jest.mock('@/lib/supabase/client')
import { createClient } from '@/lib/supabase/client'
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

function makeSupabase(options: { userId?: string; updateError?: boolean }) {
  const eqMock = jest.fn().mockResolvedValue({
    error: options.updateError ? { message: 'DB error' } : null,
  })
  const updateMock = jest.fn().mockReturnValue({ eq: eqMock })
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: options.userId ? { id: options.userId } : null },
      }),
    },
    from: jest.fn().mockReturnValue({ update: updateMock }),
  }
}

describe('OnboardingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockReturnValue(makeSupabase({ userId: 'u1' }) as any)
  })

  it('renders niche dropdown with all 10 options', () => {
    render(<OnboardingPage />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Hartanah / Ejen Hartanah')).toBeInTheDocument()
    expect(screen.getByText('Skincare / Kecantikan')).toBeInTheDocument()
  })

  it('shows validation error when submitting without selecting niche', async () => {
    render(<OnboardingPage />)
    fireEvent.submit(screen.getByRole('button', { name: /teruskan/i }))
    await waitFor(() => {
      expect(screen.getByText('Sila pilih bidang anda.')).toBeInTheDocument()
    })
  })

  it('redirects to /dashboard after successful niche selection', async () => {
    render(<OnboardingPage />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'SKINCARE' } })
    fireEvent.submit(screen.getByRole('button', { name: /teruskan/i }))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error message when DB update fails', async () => {
    mockCreateClient.mockReturnValue(makeSupabase({ userId: 'u1', updateError: true }) as any)
    render(<OnboardingPage />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'HEALTH' } })
    fireEvent.submit(screen.getByRole('button', { name: /teruskan/i }))
    await waitFor(() => {
      expect(screen.getByText('Ralat menyimpan maklumat. Cuba lagi.')).toBeInTheDocument()
    })
  })
})
