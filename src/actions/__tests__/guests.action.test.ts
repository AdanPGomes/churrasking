import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/guest-session', () => ({
  setGuestSessionCookie: vi.fn().mockResolvedValue(undefined),
}))

import { createClient } from '@/lib/supabase/server'
import { upsertGuest, updateRsvp } from '@/actions/guests'

const mockCreateClient = vi.mocked(createClient)

const EVENT_ID = 'event-123'
const EVENT_SLUG = 'backyard-bbq-abc123'
const VALID_INPUT = { name: 'Alice', email: 'alice@example.com' }

function makeSupabaseMock() {
  return {
    from: vi.fn().mockReturnValue({
      upsert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'guest-123' }, error: null }),
    }),
  }
}

describe('upsertGuest', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('when input is invalid', () => {
    it('returns a validation error without calling Supabase', async () => {
      const result = await upsertGuest(EVENT_ID, EVENT_SLUG, {
        name: 'A',
        email: 'alice@example.com',
      })

      expect(result.error).toBeDefined()
      expect(mockCreateClient).not.toHaveBeenCalled()
    })

    it('returns a validation error for an invalid email', async () => {
      const result = await upsertGuest(EVENT_ID, EVENT_SLUG, {
        name: 'Alice',
        email: 'not-an-email',
      })

      expect(result.error).toBeDefined()
      expect(mockCreateClient).not.toHaveBeenCalled()
    })
  })

  describe('when the database upsert fails', () => {
    it('returns a registration error', async () => {
      const supabase = makeSupabaseMock()
      supabase.from = vi.fn().mockReturnValue({
        upsert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      })
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await upsertGuest(EVENT_ID, EVENT_SLUG, VALID_INPUT)

      expect(result.error).toBe('Could not register. Please try again.')
    })
  })

  describe('when the guest is registered successfully', () => {
    it('redirects to the public event page', async () => {
      mockCreateClient.mockResolvedValue(makeSupabaseMock() as never)

      await expect(upsertGuest(EVENT_ID, EVENT_SLUG, VALID_INPUT)).rejects.toThrow(
        `NEXT_REDIRECT:/c/${EVENT_SLUG}`
      )
    })

    it('normalizes the email to lowercase before saving', async () => {
      const supabase = makeSupabaseMock()
      mockCreateClient.mockResolvedValue(supabase as never)

      await expect(
        upsertGuest(EVENT_ID, EVENT_SLUG, { name: 'Alice', email: 'ALICE@EXAMPLE.COM' })
      ).rejects.toThrow('NEXT_REDIRECT')

      const upsertCall = supabase.from.mock.results[0].value.upsert.mock.calls[0][0]
      expect(upsertCall.email).toBe('alice@example.com')
    })
  })
})

describe('updateRsvp', () => {
  beforeEach(() => vi.clearAllMocks())

  const GUEST_ID = 'guest-123'

  describe('when the database update fails', () => {
    it('returns an RSVP error', async () => {
      const chain: Record<string, unknown> = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(() => chain),
        then: vi.fn((resolve: (v: unknown) => unknown) =>
          Promise.resolve({ error: { message: 'DB error' } }).then(resolve)
        ),
      }
      const supabase = { from: vi.fn().mockReturnValue(chain) }
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await updateRsvp(GUEST_ID, 'confirmed')

      expect(result.error).toBe('Could not update RSVP. Please try again.')
    })
  })

  describe('when the RSVP is updated successfully', () => {
    it('returns an empty object for confirmed status', async () => {
      const chain: Record<string, unknown> = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(() => chain),
        then: vi.fn((resolve: (v: unknown) => unknown) =>
          Promise.resolve({ error: null }).then(resolve)
        ),
      }
      const supabase = { from: vi.fn().mockReturnValue(chain) }
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await updateRsvp(GUEST_ID, 'confirmed')

      expect(result).toEqual({})
    })

    it('returns an empty object for declined status', async () => {
      const chain: Record<string, unknown> = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(() => chain),
        then: vi.fn((resolve: (v: unknown) => unknown) =>
          Promise.resolve({ error: null }).then(resolve)
        ),
      }
      const supabase = { from: vi.fn().mockReturnValue(chain) }
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await updateRsvp(GUEST_ID, 'declined')

      expect(result).toEqual({})
    })
  })
})
