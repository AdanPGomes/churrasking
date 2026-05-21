import { describe, it, expect, beforeAll } from 'vitest'

import { createGuestSessionValue, verifyGuestSession } from '@/lib/guest-session'

const VALID_SESSION = { guestId: 'guest-123', eventId: 'event-456' }

describe('createGuestSessionValue', () => {
  describe('output format', () => {
    it('returns a string with two dot-separated parts', () => {
      const value = createGuestSessionValue(VALID_SESSION)
      const parts = value.split('.')

      expect(parts).toHaveLength(2)
    })

    it('encodes the payload as base64 in the first part', () => {
      const value = createGuestSessionValue(VALID_SESSION)
      const [encoded] = value.split('.')
      const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'))

      expect(decoded).toEqual(VALID_SESSION)
    })

    it('produces a hex HMAC signature in the second part', () => {
      const value = createGuestSessionValue(VALID_SESSION)
      const [, signature] = value.split('.')

      expect(signature).toMatch(/^[a-f0-9]{64}$/)
    })
  })

  describe('determinism', () => {
    it('produces the same value for the same session', () => {
      const first = createGuestSessionValue(VALID_SESSION)
      const second = createGuestSessionValue(VALID_SESSION)

      expect(first).toBe(second)
    })

    it('produces different values for different sessions', () => {
      const a = createGuestSessionValue({ guestId: 'guest-1', eventId: 'event-1' })
      const b = createGuestSessionValue({ guestId: 'guest-2', eventId: 'event-1' })

      expect(a).not.toBe(b)
    })
  })
})

describe('verifyGuestSession', () => {
  describe('with a valid token', () => {
    it('returns the original session payload', () => {
      const value = createGuestSessionValue(VALID_SESSION)
      const result = verifyGuestSession(value)

      expect(result).toEqual(VALID_SESSION)
    })
  })

  describe('with a tampered token', () => {
    it('returns null when the signature does not match', () => {
      const value = createGuestSessionValue(VALID_SESSION)
      const [encoded] = value.split('.')
      const tampered = `${encoded}.invalidsignature`

      expect(verifyGuestSession(tampered)).toBeNull()
    })

    it('returns null when the payload has been modified', () => {
      const value = createGuestSessionValue(VALID_SESSION)
      const [, signature] = value.split('.')
      const tamperedPayload = Buffer.from(
        JSON.stringify({ guestId: 'attacker', eventId: 'event-456' })
      ).toString('base64')

      expect(verifyGuestSession(`${tamperedPayload}.${signature}`)).toBeNull()
    })
  })

  describe('with a malformed token', () => {
    it('returns null when the dot separator is missing', () => {
      expect(verifyGuestSession('nodotsinhere')).toBeNull()
    })

    it('returns null when the token is an empty string', () => {
      expect(verifyGuestSession('')).toBeNull()
    })

    it('returns null when the payload is not valid base64 JSON', () => {
      const invalidPayload = 'not-base64!!!'
      const value = createGuestSessionValue(VALID_SESSION)
      const [, signature] = value.split('.')

      expect(verifyGuestSession(`${invalidPayload}.${signature}`)).toBeNull()
    })
  })
})
