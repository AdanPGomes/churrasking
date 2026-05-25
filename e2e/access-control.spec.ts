import { test, expect } from '@playwright/test'
import { GUEST_USER, SEEDED_EVENT } from './constants'

test.describe('Access control', () => {
  test.describe('when not authenticated', () => {
    test.use({ storageState: { cookies: [], origins: [] } })

    test('redirects to login when accessing host event page', async ({ page }) => {
      await page.goto(`/events/${SEEDED_EVENT.slug}`)

      await expect(page).toHaveURL(/login/, { timeout: 1500 })
    })

    test('redirects to login when accessing dashboard', async ({ page }) => {
      await page.goto('/dashboard')

      await expect(page).toHaveURL(/login/, { timeout: 15000 })
    })
  })

  test.describe('when authenticated as a different user', () => {
    test.use({ storageState: { cookies: [], origins: [] } })

    test("cannot access another host's event detail page", async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel(/e-?mail/i).fill(GUEST_USER.email)
      await page.getByLabel(/senha|password/i).fill(GUEST_USER.password)
      await page.getByRole('button', { name: /entrar|login|sign in/i }).click()

      await expect(page).toHaveURL(/dashboard/, { timeout: 15000 })

      await page.goto(`/events/${SEEDED_EVENT.slug}`)

      await expect(page.getByText(SEEDED_EVENT.title)).not.toBeVisible({ timeout: 5000 })
    })
  })
})
