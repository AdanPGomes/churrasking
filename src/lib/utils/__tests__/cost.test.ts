import { describe, it, expect } from 'vitest'

import { calculateCostSummary } from '@/lib/utils/cost'

type Item = Parameters<typeof calculateCostSummary>[0][number]

function makeItem(overrides: Partial<Item> & { id: string; name: string }): Item {
  return {
    estimated_cost: null,
    assigned_guest_id: null,
    guests: null,
    ...overrides,
  }
}

const GUEST_A = { id: 'guest-a', name: 'Alice' }
const GUEST_B = { id: 'guest-b', name: 'Bob' }

describe('calculateCostSummary', () => {
  describe('when there are no items', () => {
    it('returns zero for all totals', () => {
      const result = calculateCostSummary([], 0)

      expect(result.totalEstimated).toBe(0)
      expect(result.totalCovered).toBe(0)
      expect(result.totalUncovered).toBe(0)
      expect(result.costPerPerson).toBe(0)
    })

    it('returns empty lists for uncoveredItems and guestBreakdown', () => {
      const result = calculateCostSummary([], 0)

      expect(result.uncoveredItems).toHaveLength(0)
      expect(result.guestBreakdown).toHaveLength(0)
    })
  })

  describe('when confirmedGuests is zero', () => {
    it('returns zero costPerPerson even when items have cost', () => {
      const items = [makeItem({ id: '1', name: 'Meat', estimated_cost: 200 })]

      const { costPerPerson } = calculateCostSummary(items, 0)

      expect(costPerPerson).toBe(0)
    })
  })

  describe('when items have no estimated cost', () => {
    it('excludes them from all totals', () => {
      const items = [
        makeItem({ id: '1', name: 'Meat', estimated_cost: 100 }),
        makeItem({ id: '2', name: 'Surprise', estimated_cost: null }),
      ]

      const { totalEstimated } = calculateCostSummary(items, 2)

      expect(totalEstimated).toBe(100)
    })
  })

  describe('cost totals', () => {
    it('sums all item costs into totalEstimated', () => {
      const items = [
        makeItem({ id: '1', name: 'Meat', estimated_cost: 150 }),
        makeItem({ id: '2', name: 'Drinks', estimated_cost: 80 }),
        makeItem({ id: '3', name: 'Charcoal', estimated_cost: 30 }),
      ]

      const { totalEstimated } = calculateCostSummary(items, 3)

      expect(totalEstimated).toBe(260)
    })

    it('sums only assigned items into totalCovered', () => {
      const items = [
        makeItem({
          id: '1',
          name: 'Meat',
          estimated_cost: 150,
          assigned_guest_id: GUEST_A.id,
          guests: GUEST_A,
        }),
        makeItem({ id: '2', name: 'Drinks', estimated_cost: 80 }),
      ]

      const { totalCovered } = calculateCostSummary(items, 2)

      expect(totalCovered).toBe(150)
    })

    it('sums only unassigned items into totalUncovered', () => {
      const items = [
        makeItem({
          id: '1',
          name: 'Meat',
          estimated_cost: 150,
          assigned_guest_id: GUEST_A.id,
          guests: GUEST_A,
        }),
        makeItem({ id: '2', name: 'Drinks', estimated_cost: 80 }),
      ]

      const { totalUncovered } = calculateCostSummary(items, 2)

      expect(totalUncovered).toBe(80)
    })

    it('totalCovered + totalUncovered always equals totalEstimated', () => {
      const items = [
        makeItem({
          id: '1',
          name: 'Meat',
          estimated_cost: 150,
          assigned_guest_id: GUEST_A.id,
          guests: GUEST_A,
        }),
        makeItem({ id: '2', name: 'Drinks', estimated_cost: 80 }),
        makeItem({
          id: '3',
          name: 'Charcoal',
          estimated_cost: 30,
          assigned_guest_id: GUEST_B.id,
          guests: GUEST_B,
        }),
      ]

      const { totalEstimated, totalCovered, totalUncovered } = calculateCostSummary(items, 3)

      expect(totalCovered + totalUncovered).toBe(totalEstimated)
    })

    it('divides totalEstimated by confirmedGuests for costPerPerson', () => {
      const items = [makeItem({ id: '1', name: 'Meat', estimated_cost: 300 })]

      const { costPerPerson } = calculateCostSummary(items, 4)

      expect(costPerPerson).toBe(75)
    })
  })

  describe('uncoveredItems', () => {
    it('lists only items without an assigned guest', () => {
      const items = [
        makeItem({
          id: '1',
          name: 'Meat',
          estimated_cost: 150,
          assigned_guest_id: GUEST_A.id,
          guests: GUEST_A,
        }),
        makeItem({ id: '2', name: 'Drinks', estimated_cost: 80 }),
        makeItem({ id: '3', name: 'Charcoal', estimated_cost: 30 }),
      ]

      const { uncoveredItems } = calculateCostSummary(items, 3)

      expect(uncoveredItems).toHaveLength(2)
      expect(uncoveredItems.map((i) => i.name)).toEqual(
        expect.arrayContaining(['Drinks', 'Charcoal'])
      )
    })

    it('returns an empty list when all items are assigned', () => {
      const items = [
        makeItem({
          id: '1',
          name: 'Meat',
          estimated_cost: 150,
          assigned_guest_id: GUEST_A.id,
          guests: GUEST_A,
        }),
      ]

      const { uncoveredItems } = calculateCostSummary(items, 1)

      expect(uncoveredItems).toHaveLength(0)
    })
  })

  describe('guestBreakdown', () => {
    it('groups multiple items assigned to the same guest under one entry', () => {
      const items = [
        makeItem({
          id: '1',
          name: 'Meat',
          estimated_cost: 150,
          assigned_guest_id: GUEST_A.id,
          guests: GUEST_A,
        }),
        makeItem({
          id: '2',
          name: 'Charcoal',
          estimated_cost: 30,
          assigned_guest_id: GUEST_A.id,
          guests: GUEST_A,
        }),
      ]

      const { guestBreakdown } = calculateCostSummary(items, 1)

      expect(guestBreakdown).toHaveLength(1)
      expect(guestBreakdown[0].guestName).toBe('Alice')
      expect(guestBreakdown[0].items).toHaveLength(2)
      expect(guestBreakdown[0].subtotal).toBe(180)
    })

    it('creates a separate entry for each distinct guest', () => {
      const items = [
        makeItem({
          id: '1',
          name: 'Meat',
          estimated_cost: 150,
          assigned_guest_id: GUEST_A.id,
          guests: GUEST_A,
        }),
        makeItem({
          id: '2',
          name: 'Drinks',
          estimated_cost: 80,
          assigned_guest_id: GUEST_B.id,
          guests: GUEST_B,
        }),
      ]

      const { guestBreakdown } = calculateCostSummary(items, 2)

      expect(guestBreakdown).toHaveLength(2)
      expect(guestBreakdown.map((g) => g.guestName)).toEqual(
        expect.arrayContaining(['Alice', 'Bob'])
      )
    })

    it('resolves the guest when the guests field is an array (Supabase join format)', () => {
      const items = [
        makeItem({
          id: '1',
          name: 'Meat',
          estimated_cost: 150,
          assigned_guest_id: GUEST_A.id,
          guests: [GUEST_A],
        }),
      ]

      const { guestBreakdown } = calculateCostSummary(items, 1)

      expect(guestBreakdown).toHaveLength(1)
      expect(guestBreakdown[0].guestName).toBe('Alice')
    })

    it('omits an assigned item from the breakdown when guests is null', () => {
      const items = [
        makeItem({
          id: '1',
          name: 'Meat',
          estimated_cost: 150,
          assigned_guest_id: 'unresolved-id',
          guests: null,
        }),
      ]

      const { guestBreakdown } = calculateCostSummary(items, 1)

      expect(guestBreakdown).toHaveLength(0)
    })
  })
})
