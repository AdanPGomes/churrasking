import { test, expect } from '@playwright/test'
import { SEEDED_EVENT } from './constants'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Guest flow', () => {
  test('displays event details without login', async ({ page }) => {
    await page.goto(`/c/${SEEDED_EVENT.slug}`)

    await expect(page.getByText(SEEDED_EVENT.title)).toBeVisible()
    await expect(page.getByText(SEEDED_EVENT.location)).toBeVisible()
  })

  test('guest can register, RSVP, and claim an item', async ({ page }) => {
    await page.goto(`/c/${SEEDED_EVENT.slug}`)

    await page.getByLabel(/nome|name/i).fill('E2E Guest')
    await page.getByLabel(/e-?mail/i).fill('e2e-guest@test.com')
    await page.getByRole('button', { name: /entrar no churrasco|join|submit/i }).click()

    await expect(page).toHaveURL(new RegExp(`/c/${SEEDED_EVENT.slug}`), { timeout: 15000 })

    await page.getByRole('button', { name: /vou sim|confirm/i }).click()

    await expect(page.getByRole('button', { name: /vou sim|confirm/i })).toBeDisabled({
      timeout: 5000,
    })

    const claimButton = page.getByRole('button', { name: /pego eu|claim/i }).first()
    await claimButton.click()

    await expect(page.getByText('E2E Guest')).toBeVisible({ timeout: 5000 })
  })

  test('guest state persists after page reload (cookie session)', async ({ page }) => {
    await page.goto(`/c/${SEEDED_EVENT.slug}`)

    await page.getByLabel(/nome|name/i).fill('Persistent Guest')
    await page.getByLabel(/e-?mail/i).fill('persistent@test.com')
    await page.getByRole('button', { name: /entrar no churrasco|join|submit/i }).click()

    await expect(page).toHaveURL(new RegExp(`/c/${SEEDED_EVENT.slug}`), { timeout: 15000 })

    await page.getByRole('button', { name: /vou sim|confirm/i }).click()
    await expect(page.getByRole('button', { name: /vou sim|confirm/i })).toBeDisabled({
      timeout: 5000,
    })

    await page.reload()

    await expect(page.getByLabel(/nome|name/i)).not.toBeVisible({ timeout: 5000 })

    await expect(page.getByRole('button', { name: /vou sim|confirm/i })).toBeDisabled()
  })
})
