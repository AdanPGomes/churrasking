export function isPastEvent(date: Date) {
  return date < new Date()
}

export function getProgressValue(confirmed: number, total: number) {
  return total > 0 ? (confirmed / total) * 100 : 0
}
