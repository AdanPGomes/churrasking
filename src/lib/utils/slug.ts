import slugify from 'slugify'
import { nanoid } from 'nanoid'

export function generateSlug(title: string) {
  const base = slugify(title, { lower: true, strict: true, trim: true })
  const suffix = nanoid(6)
  return `${base}-${suffix}`
}
