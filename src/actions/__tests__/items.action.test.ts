import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/guest-session', () => ({
  getGuestSession: vi.fn(),
}))

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getGuestSession } from '@/lib/guest-session'
import { addItem, deleteItem, claimItem, unclaimItem } from '@/actions/items'

const mockCreateClient = vi.mocked(createClient)
const mockGetGuestSession = vi.mocked(getGuestSession)
const mockRevalidatePath = vi.mocked(revalidatePath)

const EVENT_ID = 'event-123'
const EVENT_SLUG = 'backyard-bbq-abc123'
const ITEM_ID = 'item-123'
const GUEST_ID = 'guest-123'
const VALID_ITEM = { name: 'Ribeye', estimated_cost: 150 }

function makeAuthenticatedSupabase() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
    rpc: vi.fn().mockResolvedValue({ error: null }),
  }
}

function makeDeleteChain(error: null | { message: string; code?: string }) {
  const chain: Record<string, unknown> = {
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockImplementation(() => chain),
    is: vi.fn().mockImplementation(() => chain),
    then: vi.fn((resolve: (v: unknown) => unknown) => Promise.resolve({ error }).then(resolve)),
  }
  return chain
}

describe('addItem', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('when input is invalid', () => {
    it('returns a validation error without calling Supabase', async () => {
      const result = await addItem(EVENT_ID, EVENT_SLUG, { name: 'A' })

      expect(result.error).toBeDefined()
      expect(mockCreateClient).not.toHaveBeenCalled()
    })
  })

  describe('when the user is not authenticated', () => {
    it('returns an Unauthorized error', async () => {
      const supabase = makeAuthenticatedSupabase()
      supabase.auth.getUser = vi.fn().mockResolvedValue({ data: { user: null } })
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await addItem(EVENT_ID, EVENT_SLUG, VALID_ITEM)

      expect(result.error).toBe('Unauthorized')
    })
  })

  describe('when the database insert fails', () => {
    it('returns an error', async () => {
      const supabase = makeAuthenticatedSupabase()
      supabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { message: 'DB error' } }),
      })
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await addItem(EVENT_ID, EVENT_SLUG, VALID_ITEM)

      expect(result.error).toBe('Failed to add item')
    })
  })

  describe('when the item is added successfully', () => {
    it('revalidates the event path', async () => {
      mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never)

      await addItem(EVENT_ID, EVENT_SLUG, VALID_ITEM)

      expect(mockRevalidatePath).toHaveBeenCalledWith(`/events/${EVENT_SLUG}`)
    })

    it('returns an empty object', async () => {
      mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never)

      const result = await addItem(EVENT_ID, EVENT_SLUG, VALID_ITEM)

      expect(result).toEqual({})
    })
  })

  describe('when the item has no estimated cost', () => {
    it('inserts null for estimated_cost', async () => {
      const supabase = makeAuthenticatedSupabase()
      mockCreateClient.mockResolvedValue(supabase as never)

      await addItem(EVENT_ID, EVENT_SLUG, { name: 'Napkins' })

      const insertCall = supabase.from.mock.results[0].value.insert.mock.calls[0][0]
      expect(insertCall.estimated_cost).toBeNull()
    })
  })
})

describe('deleteItem', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('when the user is not authenticated', () => {
    it('returns an Unauthorized error', async () => {
      const supabase = makeAuthenticatedSupabase()
      supabase.auth.getUser = vi.fn().mockResolvedValue({ data: { user: null } })
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await deleteItem(ITEM_ID, EVENT_SLUG)

      expect(result.error).toBe('Unauthorized')
    })
  })

  describe('when the database delete fails', () => {
    it('returns an error', async () => {
      const supabase = makeAuthenticatedSupabase()
      supabase.from = vi.fn().mockReturnValue(makeDeleteChain({ message: 'DB error' }))
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await deleteItem(ITEM_ID, EVENT_SLUG)

      expect(result.error).toBe('Failed to delete item')
    })
  })

  describe('when the item is deleted successfully', () => {
    it('revalidates the event path', async () => {
      const supabase = makeAuthenticatedSupabase()
      supabase.from = vi.fn().mockReturnValue(makeDeleteChain(null))
      mockCreateClient.mockResolvedValue(supabase as never)

      await deleteItem(ITEM_ID, EVENT_SLUG)

      expect(mockRevalidatePath).toHaveBeenCalledWith(`/events/${EVENT_SLUG}`)
    })

    it('returns an empty object', async () => {
      const supabase = makeAuthenticatedSupabase()
      supabase.from = vi.fn().mockReturnValue(makeDeleteChain(null))
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await deleteItem(ITEM_ID, EVENT_SLUG)

      expect(result).toEqual({})
    })
  })
})

describe('claimItem', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('when there is no active guest session', () => {
    it('returns a session expired error', async () => {
      mockGetGuestSession.mockResolvedValue(null)

      const result = await claimItem(ITEM_ID, EVENT_SLUG)

      expect(result.error).toBe('Session expired. Please identify yourself again.')
      expect(mockCreateClient).not.toHaveBeenCalled()
    })
  })

  describe('when the item has already been claimed', () => {
    it('returns a conflict error for database error code P0001', async () => {
      mockGetGuestSession.mockResolvedValue({ guestId: GUEST_ID, eventId: EVENT_ID })
      const supabase = makeAuthenticatedSupabase()
      supabase.rpc = vi
        .fn()
        .mockResolvedValue({ error: { code: 'P0001', message: 'Already claimed' } })
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await claimItem(ITEM_ID, EVENT_SLUG)

      expect(result.error).toBe('This item was just claimed by someone else.')
    })
  })

  describe('when the database rpc fails for another reason', () => {
    it('returns a generic error', async () => {
      mockGetGuestSession.mockResolvedValue({ guestId: GUEST_ID, eventId: EVENT_ID })
      const supabase = makeAuthenticatedSupabase()
      supabase.rpc = vi
        .fn()
        .mockResolvedValue({ error: { code: 'XXXXX', message: 'Unknown error' } })
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await claimItem(ITEM_ID, EVENT_SLUG)

      expect(result.error).toBe('Failed to claim item')
    })
  })

  describe('when the item is claimed successfully', () => {
    it('revalidates the public event path', async () => {
      mockGetGuestSession.mockResolvedValue({ guestId: GUEST_ID, eventId: EVENT_ID })
      mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never)

      await claimItem(ITEM_ID, EVENT_SLUG)

      expect(mockRevalidatePath).toHaveBeenCalledWith(`/c/${EVENT_SLUG}`)
    })

    it('returns an empty object', async () => {
      mockGetGuestSession.mockResolvedValue({ guestId: GUEST_ID, eventId: EVENT_ID })
      mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never)

      const result = await claimItem(ITEM_ID, EVENT_SLUG)

      expect(result).toEqual({})
    })
  })
})

describe('unclaimItem', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('when there is no active guest session', () => {
    it('returns a session expired error', async () => {
      mockGetGuestSession.mockResolvedValue(null)

      const result = await unclaimItem(ITEM_ID, EVENT_SLUG)

      expect(result.error).toBe('Session expired. Please identify yourself again.')
    })
  })

  describe('when the guest has not claimed the item', () => {
    it('returns a not claimed error for database error code P0002', async () => {
      mockGetGuestSession.mockResolvedValue({ guestId: GUEST_ID, eventId: EVENT_ID })
      const supabase = makeAuthenticatedSupabase()
      supabase.rpc = vi.fn().mockResolvedValue({ error: { code: 'P0002', message: 'Not claimed' } })
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await unclaimItem(ITEM_ID, EVENT_SLUG)

      expect(result.error).toBe('You have not claimed this item.')
    })
  })

  describe('when the item is unclaimed successfully', () => {
    it('revalidates the public event path', async () => {
      mockGetGuestSession.mockResolvedValue({ guestId: GUEST_ID, eventId: EVENT_ID })
      mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never)

      await unclaimItem(ITEM_ID, EVENT_SLUG)

      expect(mockRevalidatePath).toHaveBeenCalledWith(`/c/${EVENT_SLUG}`)
    })

    it('returns an empty object', async () => {
      mockGetGuestSession.mockResolvedValue({ guestId: GUEST_ID, eventId: EVENT_ID })
      mockCreateClient.mockResolvedValue(makeAuthenticatedSupabase() as never)

      const result = await unclaimItem(ITEM_ID, EVENT_SLUG)

      expect(result).toEqual({})
    })
  })

  describe('when the database rpc fails for another reason', () => {
    it('returns a generic error', async () => {
      mockGetGuestSession.mockResolvedValue({ guestId: GUEST_ID, eventId: EVENT_ID })
      const supabase = makeAuthenticatedSupabase()
      supabase.rpc = vi
        .fn()
        .mockResolvedValue({ error: { code: 'XXXXX', message: 'Unknown error' } })
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await unclaimItem(ITEM_ID, EVENT_SLUG)

      expect(result.error).toBe('Failed to unclaim item')
    })
  })
})
