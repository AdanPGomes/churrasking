import { test, expect } from '@playwright/test'

test.describe('Host flow', () => {
  test('dashboard shows existing events after login', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page.getByText('Test BBQ')).toBeVisible()
  })

  test('creates a new event and redirects to detail page', async ({ page }) => {
    await page.goto('/dashboard')

    await page.getByRole('link', { name: /novo churrasco|new/i }).click()
    await expect(page).toHaveURL(/events\/new/)

    await page.getByLabel(/t[ií]tulo|title/i).fill('Churrasco E2E')
    await page.getByLabel(/data|date/i).fill('2027-01-15')
    await page.getByLabel(/horário|time/i).fill('18:00')
    await page.getByLabel(/local|location/i).fill('Quintal do Teste')

    await page.getByRole('button', { name: /criar churrasco|create/i }).click()

    await expect(page).toHaveURL(/events\/churrasco-e2e/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: 'Churrasco E2E' })).toBeVisible()
  })

  test('adds item with estimated costs to an event', async ({ page }) => {
    await page.goto('/events/test-bbq-abc123')

    await expect(page.getByText('Picanha 2kg').first()).toBeVisible()
    await expect(page.getByText('Carvão 5kg').first()).toBeVisible()
  })

  test('copies the shareable link with correct slug', async ({ page }) => {
    await page.goto('/events/test-bbq-abc123')

    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.getByRole('button', { name: /copiar link|copy link/i }).click()

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toContain('/c/test-bbq-abc123')
  })

  test('cost summary displays correct totals for seeded items', async ({ page }) => {
    await page.goto('/events/test-bbq-abc123')

    await expect(page.getByText('185')).toBeVisible()
  })
})
