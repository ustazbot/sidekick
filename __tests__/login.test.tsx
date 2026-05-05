import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/(auth)/login/page'

const mockSignInWithOtp = jest.fn()
const mockSignInWithPassword = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOtp: mockSignInWithOtp,
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}))

const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

describe('LoginPage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders email field and magic link button by default', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Hantar Magic Link/i })).toBeInTheDocument()
    expect(screen.queryByLabelText('Kata Laluan')).not.toBeInTheDocument()
  })

  it('reveals password field when "Guna kata laluan" is clicked', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.click(screen.getByText(/Guna kata laluan/i))
    expect(screen.getByLabelText('Kata Laluan')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Log Masuk$/i })).toBeInTheDocument()
  })

  it('sends magic link and shows BM success message', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'user@test.com')
    await user.click(screen.getByRole('button', { name: /Hantar Magic Link/i }))

    await waitFor(() => {
      expect(screen.getByText(/Semak email anda/i)).toBeInTheDocument()
    })
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'user@test.com',
      options: {
        shouldCreateUser: false,
        emailRedirectTo: expect.stringContaining('/auth/callback'),
      },
    })
  })

  it('shows BM error when magic link fails', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: { message: 'User not found' } })
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'ghost@test.com')
    await user.click(screen.getByRole('button', { name: /Hantar Magic Link/i }))

    await waitFor(() => {
      expect(screen.getByText(/Ralat menghantar magic link/i)).toBeInTheDocument()
    })
  })

  it('logs in with password and redirects to /dashboard', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByText(/Guna kata laluan/i))
    await user.type(screen.getByLabelText('Email'), 'user@test.com')
    await user.type(screen.getByLabelText('Kata Laluan'), 'secret123')
    await user.click(screen.getByRole('button', { name: /^Log Masuk$/i }))

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'))
  })

  it('shows BM error on wrong password', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByText(/Guna kata laluan/i))
    await user.type(screen.getByLabelText('Email'), 'user@test.com')
    await user.type(screen.getByLabelText('Kata Laluan'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /^Log Masuk$/i }))

    await waitFor(() => {
      expect(screen.getByText(/Email atau kata laluan tidak sah/i)).toBeInTheDocument()
    })
  })
})
