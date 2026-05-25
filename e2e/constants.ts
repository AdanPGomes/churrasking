export const HOST = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'host@test.churrasking.com',
  password: 'Test1234!',
  name: 'Test Host',
}

export const GUEST_USER = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'guest@test.churrasking.com',
  password: 'Test1234!',
  name: 'Test Guest',
}

export const SEEDED_EVENT = {
  id: '00000000-0000-0000-0000-000000000003',
  title: 'Test BBQ',
  slug: 'test-bbq-abc123',
  location: 'Test Location',
  items: [
    { name: 'Picanha 2kg', cost: 150 },
    { name: 'Carvão 5kg', cost: 35 },
  ],
  totalCost: 185,
}
