import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { login, register, logout } from '@/actions/auth'

const mockCreateClient = vi.mocked(createClient)
const mockRedirect = vi.mocked(redirect)

function makeSupabaseMock(overrides: Record<string, unknown> = {}) {
  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({}),
      ...overrides,
    },
  }
}

describe('login', () => {
  beforeEach(() => vi.clearAllMocks())

  const VALID_INPUT = { email: 'alice@example.com', password: 'securepassword' }

  describe('when input is invalid', () => {
    it('returns a validation error without calling Supabase', async () => {
      const result = await login({ email: 'not-an-email', password: 'securepassword' })

      expect(result?.error).toBeDefined()
      expect(mockCreateClient).not.toHaveBeenCalled()
    })
  })

  describe('when credentials are wrong', () => {
    it('returns an invalid credentials error', async () => {
      const supabase = makeSupabaseMock({
        signInWithPassword: vi.fn().mockResolvedValue({ error: { message: 'Invalid login' } }),
      })
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await login(VALID_INPUT)

      expect(result?.error).toBe('Invalid email or password')
    })
  })

  describe('when login is successful', () => {
    it('redirects to the dashboard', async () => {
      mockCreateClient.mockResolvedValue(makeSupabaseMock() as never)

      await expect(login(VALID_INPUT)).rejects.toThrow('NEXT_REDIRECT:/dashboard')
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
    })
  })
})

describe('register', () => {
  beforeEach(() => vi.clearAllMocks())

  const VALID_INPUT = {
    name: 'Alice',
    email: 'alice@example.com',
    password: 'securepassword',
    confirmPassword: 'securepassword',
  }

  describe('when input is invalid', () => {
    it('returns a validation error without calling Supabase', async () => {
      const result = await register({ ...VALID_INPUT, name: 'A' })

      expect(result?.error).toBeDefined()
      expect(mockCreateClient).not.toHaveBeenCalled()
    })

    it('returns a validation error when passwords do not match', async () => {
      const result = await register({ ...VALID_INPUT, confirmPassword: 'different' })

      expect(result?.error).toContain('do not match')
      expect(mockCreateClient).not.toHaveBeenCalled()
    })
  })

  describe('when the email is already registered', () => {
    it('returns an account exists error', async () => {
      const supabase = makeSupabaseMock({
        signUp: vi.fn().mockResolvedValue({ error: { message: 'User already registered' } }),
      })
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await register(VALID_INPUT)

      expect(result?.error).toBe('An account with this email already exists')
    })
  })

  describe('when signup fails for another reason', () => {
    it('returns a generic error', async () => {
      const supabase = makeSupabaseMock({
        signUp: vi.fn().mockResolvedValue({ error: { message: 'Unexpected error' } }),
      })
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await register(VALID_INPUT)

      expect(result?.error).toBe('Could not create account. Please try again')
    })
  })

  describe('when registration is successful', () => {
    it('redirects to the dashboard', async () => {
      mockCreateClient.mockResolvedValue(makeSupabaseMock() as never)

      await expect(register(VALID_INPUT)).rejects.toThrow('NEXT_REDIRECT:/dashboard')
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
    })
  })
})

describe('logout', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to the login page', async () => {
    mockCreateClient.mockResolvedValue(makeSupabaseMock() as never)

    await expect(logout()).rejects.toThrow('NEXT_REDIRECT:/login')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})
