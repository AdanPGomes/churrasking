import { describe, it, expect } from 'vitest'

import { addItemSchema } from '@/lib/validations/items'

describe('addItemSchema', () => {
  describe('with valid input', () => {
    it('accepts a valid name without a cost', () => {
      const result = addItemSchema.safeParse({ name: 'Charcoal' })

      expect(result.success).toBe(true)
    })

    it('accepts a valid name with a cost', () => {
      const result = addItemSchema.safeParse({ name: 'Ribeye', estimated_cost: 150 })

      expect(result.success).toBe(true)
    })

    it('accepts estimated_cost of zero', () => {
      const result = addItemSchema.safeParse({ name: 'Napkins', estimated_cost: 0 })

      expect(result.success).toBe(true)
    })

    it('coerces a string estimated_cost into a number', () => {
      const result = addItemSchema.safeParse({ name: 'Charcoal', estimated_cost: '30' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.estimated_cost).toBe(30)
      }
    })

    it('accepts a name at the maximum length boundary', () => {
      const result = addItemSchema.safeParse({ name: 'A'.repeat(100) })

      expect(result.success).toBe(true)
    })
  })

  describe('name validation', () => {
    it('rejects a name shorter than 2 characters', () => {
      const result = addItemSchema.safeParse({ name: 'A' })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('name'))
        expect(issue?.message).toContain('2 characters')
      }
    })

    it('rejects a name longer than 100 characters', () => {
      const result = addItemSchema.safeParse({ name: 'A'.repeat(101) })

      expect(result.success).toBe(false)
    })

    it('rejects a missing name', () => {
      const result = addItemSchema.safeParse({})

      expect(result.success).toBe(false)
    })
  })

  describe('estimated_cost validation', () => {
    it('rejects a negative cost', () => {
      const result = addItemSchema.safeParse({ name: 'Meat', estimated_cost: -1 })

      expect(result.success).toBe(false)
    })
  })
})
