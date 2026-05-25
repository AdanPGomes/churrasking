import { test as setup, expect } from '@playwright/test'

const HOST_EMAIL = 'host@test.churrasking.com'
const HOST_PASSWORD = 'Test1234!'
const AUTH_FILE = 'e2e/.auth/user.json'

setup('authenticate as host user', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel(/email|e-?mail/i).fill(HOST_EMAIL)
  await page.getByLabel(/senha|password/i).fill(HOST_PASSWORD)
  await page.getByRole('button', { name: /entrar|login|sign in/i }).click()

  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 })

  await page.context().storageState({ path: AUTH_FILE })
})
