import { z } from 'zod'

const itemsSchema = z.object({
  name: z.string().min(2, 'Item name is must be at least 2 characters'),
  estimated_cost: z.coerce.number().min(0).optional(),
})

export const createEventSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    description: z.string().max(500).optional(),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    location: z.string().max(200).optional(),
    items: z.array(itemsSchema).optional(),
  })
  .refine(
    (data) => {
      const combined = new Date(`${data.date}T${data.time}`)
      return combined > new Date()
    },
    {
      message: 'Event must be scheduled in the future',
      path: ['date'],
    }
  )

export type CreateEventInput = z.infer<typeof createEventSchema>
