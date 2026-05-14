import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/(auth)/login/page'

const mockSignInWithPassword = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signInWithPassword: mockSignInWithPassword },
  }),
}))

const mockPush    = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

describe('LoginPage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders email and password fields with Log Masuk button', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Kata Laluan')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Log Masuk$/i })).toBeInTheDocument()
  })

  it('logs in with password and redirects to /dashboard', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'user@test.com')
    await user.type(screen.getByLabelText('Kata Laluan'), 'secret123')
    await user.click(screen.getByRole('button', { name: /^Log Masuk$/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
      expect(mockRefresh).toHaveBeenCalledTimes(1)
    })
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'secret123',
    })
  })

  it('shows error on wrong credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText('Email'), 'user@test.com')
    await user.type(screen.getByLabelText('Kata Laluan'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /^Log Masuk$/i }))

    await waitFor(() => {
      expect(screen.getByText(/Email atau kata laluan tidak sah/i)).toBeInTheDocument()
    })
  })

  it('shows link to checkout for new users', () => {
    render(<LoginPage />)
    expect(screen.getByText(/Beli SIDEKICK/i)).toBeInTheDocument()
  })
})
