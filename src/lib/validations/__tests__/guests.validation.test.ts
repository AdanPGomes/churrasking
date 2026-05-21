import { describe, it, expect } from 'vitest'

import { guestSchema } from '@/lib/validations/guests'

describe('guestSchema', () => {
  describe('with valid input', () => {
    it('accepts a valid name and email', () => {
      const result = guestSchema.safeParse({ name: 'Alice', email: 'alice@example.com' })

      expect(result.success).toBe(true)
    })

    it('accepts a name at the minimum length boundary', () => {
      const result = guestSchema.safeParse({ name: 'Al', email: 'al@example.com' })

      expect(result.success).toBe(true)
    })

    it('accepts a name at the maximum length boundary', () => {
      const result = guestSchema.safeParse({ name: 'A'.repeat(80), email: 'a@example.com' })

      expect(result.success).toBe(true)
    })
  })

  describe('name validation', () => {
    it('rejects a name shorter than 2 characters', () => {
      const result = guestSchema.safeParse({ name: 'A', email: 'a@example.com' })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('name'))
        expect(issue?.message).toContain('2 characters')
      }
    })

    it('rejects a name longer than 80 characters', () => {
      const result = guestSchema.safeParse({ name: 'A'.repeat(81), email: 'a@example.com' })

      expect(result.success).toBe(false)
    })

    it('rejects a missing name', () => {
      const result = guestSchema.safeParse({ email: 'a@example.com' })

      expect(result.success).toBe(false)
    })
  })

  describe('email validation', () => {
    it('rejects a missing email', () => {
      const result = guestSchema.safeParse({ name: 'Alice' })

      expect(result.success).toBe(false)
    })

    it('rejects an email without an @ symbol', () => {
      const result = guestSchema.safeParse({ name: 'Alice', email: 'notanemail' })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('email'))
        expect(issue?.message).toContain('Invalid email')
      }
    })

    it('rejects an email without a domain', () => {
      const result = guestSchema.safeParse({ name: 'Alice', email: 'alice@' })

      expect(result.success).toBe(false)
    })

    it('rejects an email without a local part', () => {
      const result = guestSchema.safeParse({ name: 'Alice', email: '@example.com' })

      expect(result.success).toBe(false)
    })
  })
})
