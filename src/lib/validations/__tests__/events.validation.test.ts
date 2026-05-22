import { describe, it, expect } from 'vitest'
import { createEventSchema, updateEventSchema } from '@/lib/validations/events'

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0] // YYYY-MM-DD
}

const FUTURE_DATE = daysFromNow(7)
const PAST_DATE = '2020-01-01'

const VALID_INPUT = {
  title: 'Backyard BBQ',
  date: FUTURE_DATE,
  time: '18:00',
}

describe('createEventSchema', () => {
  describe('with valid input', () => {
    it('accepts the minimum required fields', () => {
      const result = createEventSchema.safeParse(VALID_INPUT)

      expect(result.success).toBe(true)
    })

    it('accepts all optional fields when provided', () => {
      const result = createEventSchema.safeParse({
        ...VALID_INPUT,
        description: 'Best BBQ of the year',
        location: '123 Main St',
        items: [{ name: 'Ribeye', estimated_cost: 150 }],
      })

      expect(result.success).toBe(true)
    })

    it('accepts an empty items array', () => {
      const result = createEventSchema.safeParse({ ...VALID_INPUT, items: [] })

      expect(result.success).toBe(true)
    })

    it('accepts an item without estimated_cost', () => {
      const result = createEventSchema.safeParse({
        ...VALID_INPUT,
        items: [{ name: 'Charcoal' }],
      })

      expect(result.success).toBe(true)
    })

    it('accepts an item with estimated_cost of zero', () => {
      const result = createEventSchema.safeParse({
        ...VALID_INPUT,
        items: [{ name: 'Charcoal', estimated_cost: 0 }],
      })

      expect(result.success).toBe(true)
    })

    it('coerces a string estimated_cost into a number', () => {
      const result = createEventSchema.safeParse({
        ...VALID_INPUT,
        items: [{ name: 'Charcoal', estimated_cost: '50' }],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.items?.[0].estimated_cost).toBe(50)
      }
    })
  })

  describe('title validation', () => {
    it('rejects a title shorter than 3 characters', () => {
      const result = createEventSchema.safeParse({ ...VALID_INPUT, title: 'AB' })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('title'))
        expect(issue?.message).toContain('3 characters')
      }
    })

    it('rejects a title longer than 100 characters', () => {
      const result = createEventSchema.safeParse({ ...VALID_INPUT, title: 'A'.repeat(101) })

      expect(result.success).toBe(false)
    })

    it('rejects a missing title', () => {
      const { title: _, ...withoutTitle } = VALID_INPUT
      const result = createEventSchema.safeParse(withoutTitle)

      expect(result.success).toBe(false)
    })
  })

  describe('date and time validation', () => {
    it('rejects a missing date', () => {
      const { date: _, ...withoutDate } = VALID_INPUT
      const result = createEventSchema.safeParse(withoutDate)

      expect(result.success).toBe(false)
    })

    it('rejects a missing time', () => {
      const { time: _, ...withoutTime } = VALID_INPUT
      const result = createEventSchema.safeParse(withoutTime)

      expect(result.success).toBe(false)
    })

    it('rejects an event date in the past', () => {
      const result = createEventSchema.safeParse({
        ...VALID_INPUT,
        date: PAST_DATE,
        time: '12:00',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('date'))
        expect(issue?.message).toContain('future')
      }
    })

    it('accepts an event date in the future', () => {
      const result = createEventSchema.safeParse({
        ...VALID_INPUT,
        date: daysFromNow(30),
        time: '12:00',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('description validation', () => {
    it('rejects a description longer than 500 characters', () => {
      const result = createEventSchema.safeParse({
        ...VALID_INPUT,
        description: 'A'.repeat(501),
      })

      expect(result.success).toBe(false)
    })

    it('accepts a missing description', () => {
      const result = createEventSchema.safeParse(VALID_INPUT)

      expect(result.success).toBe(true)
    })
  })

  describe('items validation', () => {
    it('rejects an item name shorter than 2 characters', () => {
      const result = createEventSchema.safeParse({
        ...VALID_INPUT,
        items: [{ name: 'A' }],
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.join('.').includes('name'))
        expect(issue).toBeDefined()
      }
    })

    it('rejects a negative estimated_cost', () => {
      const result = createEventSchema.safeParse({
        ...VALID_INPUT,
        items: [{ name: 'Meat', estimated_cost: -10 }],
      })

      expect(result.success).toBe(false)
    })
  })
})

describe('updateEventSchema', () => {
  describe('past date handling', () => {
    it('accepts a date in the past', () => {
      const result = updateEventSchema.safeParse({
        title: 'Backyard BBQ',
        date: PAST_DATE,
        time: '12:00',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('required fields', () => {
    it('rejects an empty object', () => {
      const result = updateEventSchema.safeParse({})

      expect(result.success).toBe(false)
    })
  })

  describe('items validation', () => {
    it('applies the same item rules as createEventSchema', () => {
      const result = updateEventSchema.safeParse({
        title: 'Backyard BBQ',
        date: FUTURE_DATE,
        time: '18:00',
        items: [{ name: 'A' }],
      })

      expect(result.success).toBe(false)
    })
  })
})
