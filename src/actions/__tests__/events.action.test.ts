import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/utils/slug', () => ({
  generateSlug: vi.fn(() => 'test-slug-abc123'),
}))

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { createEvent, updateEvent, deleteEvent } from '@/actions/events'

const mockCreateClient = vi.mocked(createClient)
const mockRedirect = vi.mocked(redirect)
const mockRevalidatePath = vi.mocked(revalidatePath)

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData()
  fd.set('title', 'Backyard BBQ')
  fd.set('date', futureDate())
  fd.set('time', '18:00')
  fd.set('items', '[]')
  for (const [key, value] of Object.entries(overrides)) {
    fd.set(key, value)
  }
  return fd
}

function futureDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]
}

function makeSupabaseMock(overrides: Record<string, unknown> = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi
          .fn()
          .mockResolvedValue({ data: { path: 'user-123/test-slug/cover.jpg' }, error: null }),
        getPublicUrl: vi
          .fn()
          .mockReturnValue({ data: { publicUrl: 'https://example.com/cover.jpg' } }),
      }),
    },
    rpc: vi.fn().mockResolvedValue({ data: [{ slug: 'test-slug-abc123' }], error: null }),
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      mockResolvedValue: vi.fn().mockResolvedValue({ error: null }),
    }),
    ...overrides,
  }
}

describe('createEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when input is invalid', () => {
    it('returns a validation error without calling Supabase', async () => {
      const fd = makeFormData({ title: 'AB' }) // too short

      const result = await createEvent(fd)

      expect(result.error).toBeDefined()
      expect(mockCreateClient).not.toHaveBeenCalled()
    })

    it('returns an error when the event date is in the past', async () => {
      const fd = makeFormData({ date: '2020-01-01', time: '12:00' })

      const result = await createEvent(fd)

      expect(result.error).toBeDefined()
      expect(mockCreateClient).not.toHaveBeenCalled()
    })
  })

  describe('when the user is not authenticated', () => {
    it('returns an Unauthorized error', async () => {
      const supabase = makeSupabaseMock()
      supabase.auth.getUser = vi.fn().mockResolvedValue({ data: { user: null } })
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await createEvent(makeFormData())

      expect(result.error).toBe('Unauthorized')
    })
  })

  describe('when the cover image exceeds the size limit', () => {
    it('returns a file size error without inserting the event', async () => {
      const supabase = makeSupabaseMock()
      mockCreateClient.mockResolvedValue(supabase as never)

      const fd = makeFormData()
      const oversizedFile = new File(['x'.repeat(6 * 1024 * 1024)], 'cover.jpg', {
        type: 'image/jpeg',
      })
      fd.set('cover', oversizedFile)

      const result = await createEvent(fd)

      expect(result.error).toBe('Cover image must be less than 5MB')
      expect(supabase.rpc).not.toHaveBeenCalled()
    })
  })

  describe('when the cover upload fails', () => {
    it('returns an upload error without inserting the event', async () => {
      const supabase = makeSupabaseMock()
      supabase.storage.from = vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: null, error: { message: 'Storage error' } }),
        getPublicUrl: vi.fn(),
      })
      mockCreateClient.mockResolvedValue(supabase as never)

      const fd = makeFormData()
      const file = new File(['image'], 'cover.jpg', { type: 'image/jpeg' })
      fd.set('cover', file)

      const result = await createEvent(fd)

      expect(result.error).toBe('Failed to upload cover image')
      expect(supabase.rpc).not.toHaveBeenCalled()
    })
  })

  describe('when a valid cover image is provided', () => {
    it('uploads the cover and proceeds to create the event', async () => {
      const supabase = makeSupabaseMock()
      mockCreateClient.mockResolvedValue(supabase as never)

      const fd = makeFormData()
      const file = new File(['image'], 'cover.jpg', { type: 'image/jpeg' })
      fd.set('cover', file)

      await expect(createEvent(fd)).rejects.toThrow('NEXT_REDIRECT')

      expect(supabase.storage.from).toHaveBeenCalledWith('event-covers')
      expect(supabase.rpc).toHaveBeenCalled()
    })
  })

  describe('when items are provided', () => {
    it('maps items into the rpc call', async () => {
      const supabase = makeSupabaseMock()
      mockCreateClient.mockResolvedValue(supabase as never)

      const items = [{ name: 'Ribeye', estimated_cost: 150 }]
      const fd = makeFormData({ items: JSON.stringify(items) })

      await expect(createEvent(fd)).rejects.toThrow('NEXT_REDIRECT')

      const rpcCall = supabase.rpc.mock.calls[0][1]
      expect(rpcCall.p_items).toEqual([{ name: 'Ribeye', estimated_cost: 150 }])
    })
  })

  describe('when the database insert fails', () => {
    it('returns a creation error', async () => {
      const supabase = makeSupabaseMock()
      supabase.rpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await createEvent(makeFormData())

      expect(result.error).toBe('Failed to create event')
    })
  })

  describe('when the event is created successfully', () => {
    it('redirects to the new event page', async () => {
      const supabase = makeSupabaseMock()
      mockCreateClient.mockResolvedValue(supabase as never)

      await expect(createEvent(makeFormData())).rejects.toThrow(
        'NEXT_REDIRECT:/events/test-slug-abc123'
      )
      expect(mockRedirect).toHaveBeenCalledWith('/events/test-slug-abc123')
    })
  })
})

describe('updateEvent', () => {
  const EVENT_ID = 'event-123'
  const CURRENT_SLUG = 'current-slug'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when input is invalid', () => {
    it('returns a validation error without calling Supabase', async () => {
      const fd = makeFormData({ title: 'AB' })

      const result = await updateEvent(EVENT_ID, CURRENT_SLUG, fd)

      expect(result.error).toBeDefined()
      expect(mockCreateClient).not.toHaveBeenCalled()
    })
  })

  describe('when the user is not authenticated', () => {
    it('returns an Unauthorized error', async () => {
      const supabase = makeSupabaseMock()
      supabase.auth.getUser = vi.fn().mockResolvedValue({ data: { user: null } })
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await updateEvent(EVENT_ID, CURRENT_SLUG, makeFormData())

      expect(result.error).toBe('Unauthorized')
    })
  })

  describe('when the cover image exceeds the size limit', () => {
    it('returns a file size error without updating the event', async () => {
      const supabase = makeSupabaseMock()
      mockCreateClient.mockResolvedValue(supabase as never)

      const fd = makeFormData()
      const oversizedFile = new File(['x'.repeat(6 * 1024 * 1024)], 'cover.jpg', {
        type: 'image/jpeg',
      })
      fd.set('cover', oversizedFile)

      const result = await updateEvent(EVENT_ID, CURRENT_SLUG, fd)

      expect(result.error).toBe('Cover image must be less than 5MB')
    })
  })

  describe('when the database update fails', () => {
    it('returns an update error', async () => {
      const supabase = makeSupabaseMock()
      const chain: Record<string, unknown> = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(() => chain),
        then: vi.fn((resolve: (v: unknown) => unknown) =>
          Promise.resolve({ error: { message: 'DB error' } }).then(resolve)
        ),
      }
      supabase.from = vi.fn().mockReturnValue(chain)
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await updateEvent(EVENT_ID, CURRENT_SLUG, makeFormData())

      expect(result.error).toBe('Failed to update event')
    })
  })

  describe('when the event is updated successfully', () => {
    it('revalidates the event and dashboard paths', async () => {
      const supabase = makeSupabaseMock()
      const chain: Record<string, unknown> = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(() => chain),
        then: vi.fn((resolve: (v: unknown) => unknown) =>
          Promise.resolve({ error: null }).then(resolve)
        ),
      }
      supabase.from = vi.fn().mockReturnValue(chain)
      mockCreateClient.mockResolvedValue(supabase as never)

      await expect(updateEvent(EVENT_ID, CURRENT_SLUG, makeFormData())).rejects.toThrow(
        'NEXT_REDIRECT'
      )

      expect(mockRevalidatePath).toHaveBeenCalledWith(`/events/${CURRENT_SLUG}`)
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    })
  })
})

describe('deleteEvent', () => {
  const EVENT_ID = 'event-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when the user is not authenticated', () => {
    it('returns an Unauthorized error', async () => {
      const supabase = makeSupabaseMock()
      supabase.auth.getUser = vi.fn().mockResolvedValue({ data: { user: null } })
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await deleteEvent(EVENT_ID)

      expect(result.error).toBe('Unauthorized')
    })
  })

  describe('when the database delete fails', () => {
    it('returns a deletion error', async () => {
      const supabase = makeSupabaseMock()
      const chain: Record<string, unknown> = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(() => chain),
        then: vi.fn((resolve: (v: unknown) => unknown) =>
          Promise.resolve({ error: { message: 'DB error' } }).then(resolve)
        ),
      }
      supabase.from = vi.fn().mockReturnValue(chain)
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await deleteEvent(EVENT_ID)

      expect(result.error).toBe('Failed to delete event')
    })
  })

  describe('when the event is deleted successfully', () => {
    function makeDeleteChain(error: null | { message: string }) {
      const chain: Record<string, unknown> = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation(() => chain),
        then: vi.fn((resolve: (v: unknown) => unknown) => Promise.resolve({ error }).then(resolve)),
      }
      return chain
    }

    it('revalidates the dashboard path', async () => {
      const supabase = makeSupabaseMock()
      supabase.from = vi.fn().mockReturnValue(makeDeleteChain(null))
      mockCreateClient.mockResolvedValue(supabase as never)

      await deleteEvent(EVENT_ID)

      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    })

    it('returns an empty object', async () => {
      const supabase = makeSupabaseMock()
      supabase.from = vi.fn().mockReturnValue(makeDeleteChain(null))
      mockCreateClient.mockResolvedValue(supabase as never)

      const result = await deleteEvent(EVENT_ID)

      expect(result).toEqual({})
    })
  })
})
