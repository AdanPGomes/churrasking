type Item = {
  id: string
  name: string
  estimated_cost: number | null
  assigned_guest_id: string | null
  guests: { id: string; name: string } | { id: string; name: string }[] | null
}

type GuestBreakdown = {
  guestId: string
  guestName: string
  items: { name: string; cost: number }[]
  subtotal: number
}

type CostSummary = {
  totalEstimated: number
  totalCovered: number
  totalUncovered: number
  costPerPerson: number
  uncoveredItems: { name: string; cost: number }[]
  guestBreakdown: GuestBreakdown[]
}

function getGuest(guests: Item['guests']): { id: string; name: string } | null {
  if (!guests) return null
  const guest = Array.isArray(guests) ? guests[0] : guests
  return guest ?? null
}

export function calculateCostSummary(items: Item[], confirmedGuests: number): CostSummary {
  const itemsWithCost = items.filter((i) => i.estimated_cost !== null)

  const totalEstimated = itemsWithCost.reduce((acc, i) => acc + (i.estimated_cost ?? 0), 0)

  const coveredItems = itemsWithCost.filter((i) => i.assigned_guest_id !== null)
  const uncoveredItems = itemsWithCost.filter((i) => i.assigned_guest_id === null)

  const totalCovered = coveredItems.reduce((acc, i) => acc + (i.estimated_cost ?? 0), 0)

  const totalUncovered = uncoveredItems.reduce((acc, i) => acc + (i.estimated_cost ?? 0), 0)

  const costPerPerson = confirmedGuests > 0 ? totalEstimated / confirmedGuests : 0

  const guestMap = new Map<string, GuestBreakdown>()

  for (const item of coveredItems) {
    const guest = getGuest(item.guests)
    if (!guest) continue

    if (!guestMap.has(guest.id)) {
      guestMap.set(guest.id, {
        guestId: guest.id,
        guestName: guest.name,
        items: [],
        subtotal: 0,
      })
    }

    const breakdown = guestMap.get(guest.id)!
    breakdown.items.push({ name: item.name, cost: item.estimated_cost ?? 0 })
    breakdown.subtotal += item.estimated_cost ?? 0
  }

  return {
    totalEstimated,
    totalCovered,
    totalUncovered,
    costPerPerson,
    uncoveredItems: uncoveredItems.map((i) => ({
      name: i.name,
      cost: i.estimated_cost ?? 0,
    })),
    guestBreakdown: Array.from(guestMap.values()),
  }
}
