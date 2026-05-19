import { z } from 'zod'

export const addItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters').max(100),
  estimated_cost: z.coerce.number().min(0).optional(),
})

export type AddItemInput = z.infer<typeof addItemSchema>
