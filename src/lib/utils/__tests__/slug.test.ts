import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'abc123'),
}))

import { generateSlug } from '@/lib/utils/slug'
import { nanoid } from 'nanoid'

const mockNanoid = vi.mocked(nanoid)

describe('generateSlug', () => {
  beforeEach(() => {
    mockNanoid.mockReturnValue('abc123')
  })

  describe('output format', () => {
    it('produces a lowercase hyphenated string followed by the nanoid suffix', () => {
      const slug = generateSlug('Churrasco do Adan')

      expect(slug).toBe('churrasco-do-adan-abc123')
    })

    it('converts uppercase letters to lowercase', () => {
      const slug = generateSlug('CHURRASCO GRANDE')

      expect(slug).toBe('churrasco-grande-abc123')
    })

    it('replaces spaces with hyphens', () => {
      const slug = generateSlug('Churrasco de Verao')

      expect(slug).not.toContain(' ')
      expect(slug).toContain('-')
    })

    it('contains only lowercase letters, digits, and hyphens', () => {
      const slug = generateSlug('Churrasco & Festa! (2024)')

      expect(slug).toMatch(/^[a-z0-9-]+$/)
    })

    it('always ends with the nanoid suffix', () => {
      const slug = generateSlug('Any title here')

      expect(slug.endsWith('-abc123')).toBe(true)
    })
  })

  describe('special characters', () => {
    it('strips punctuation and symbols', () => {
      const slug = generateSlug('Hello, World!')

      expect(slug).toMatch(/^[a-z0-9-]+-abc123$/)
    })

    it('handles a title composed entirely of special characters', () => {
      const slug = generateSlug('!!!')

      expect(slug).toContain('abc123')
      expect(slug.length).toBeGreaterThan(0)
    })

    it('handles a very long title without throwing', () => {
      const slug = generateSlug('a'.repeat(300))

      expect(typeof slug).toBe('string')
      expect(slug.length).toBeGreaterThan(0)
    })
  })

  describe('uniqueness', () => {
    it('produces different slugs for the same title on successive calls', () => {
      mockNanoid.mockReturnValueOnce('aaaaaa').mockReturnValueOnce('bbbbbb')

      const first = generateSlug('Churrasco')
      const second = generateSlug('Churrasco')

      expect(first).toBe('churrasco-aaaaaa')
      expect(second).toBe('churrasco-bbbbbb')
      expect(first).not.toBe(second)
    })
  })
})
