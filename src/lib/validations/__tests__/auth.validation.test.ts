import { describe, it, expect } from 'vitest'

import { loginSchema, registerSchema } from '@/lib/validations/auth'

describe('loginSchema', () => {
  describe('with valid input', () => {
    it('accepts a valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'securepassword',
      })

      expect(result.success).toBe(true)
    })

    it('accepts a password at the minimum length boundary', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '12345678',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('email validation', () => {
    it('rejects a missing email', () => {
      const result = loginSchema.safeParse({ password: 'securepassword' })

      expect(result.success).toBe(false)
    })

    it('rejects a malformed email', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'securepassword',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('email'))
        expect(issue?.message).toContain('Invalid email')
      }
    })
  })

  describe('password validation', () => {
    it('rejects a missing password', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com' })

      expect(result.success).toBe(false)
    })

    it('rejects a password shorter than 8 characters', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '1234567',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('password'))
        expect(issue?.message).toContain('8 characters')
      }
    })
  })
})

describe('registerSchema', () => {
  const VALID_INPUT = {
    name: 'Alice',
    email: 'alice@example.com',
    password: 'securepassword',
    confirmPassword: 'securepassword',
  }

  describe('with valid input', () => {
    it('accepts all required fields when passwords match', () => {
      const result = registerSchema.safeParse(VALID_INPUT)

      expect(result.success).toBe(true)
    })

    it('accepts a password at the minimum length boundary', () => {
      const result = registerSchema.safeParse({
        ...VALID_INPUT,
        password: '12345678',
        confirmPassword: '12345678',
      })

      expect(result.success).toBe(true)
    })

    it('accepts a password at the maximum length boundary', () => {
      const password = 'A'.repeat(72)
      const result = registerSchema.safeParse({
        ...VALID_INPUT,
        password,
        confirmPassword: password,
      })

      expect(result.success).toBe(true)
    })
  })

  describe('name validation', () => {
    it('rejects a name shorter than 2 characters', () => {
      const result = registerSchema.safeParse({ ...VALID_INPUT, name: 'A' })

      expect(result.success).toBe(false)
    })

    it('rejects a name longer than 60 characters', () => {
      const result = registerSchema.safeParse({ ...VALID_INPUT, name: 'A'.repeat(61) })

      expect(result.success).toBe(false)
    })
  })

  describe('password validation', () => {
    it('rejects a password shorter than 8 characters', () => {
      const result = registerSchema.safeParse({
        ...VALID_INPUT,
        password: '1234567',
        confirmPassword: '1234567',
      })

      expect(result.success).toBe(false)
    })

    it('rejects a password longer than 72 characters', () => {
      const password = 'A'.repeat(73)
      const result = registerSchema.safeParse({
        ...VALID_INPUT,
        password,
        confirmPassword: password,
      })

      expect(result.success).toBe(false)
    })
  })

  describe('password confirmation', () => {
    it('rejects when confirmPassword does not match password', () => {
      const result = registerSchema.safeParse({
        ...VALID_INPUT,
        password: 'securepassword',
        confirmPassword: 'differentpassword',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('confirmPassword'))
        expect(issue?.message).toContain('do not match')
      }
    })

    it('rejects a missing confirmPassword', () => {
      const { confirmPassword: _, ...withoutConfirm } = VALID_INPUT
      const result = registerSchema.safeParse(withoutConfirm)

      expect(result.success).toBe(false)
    })
  })
})
