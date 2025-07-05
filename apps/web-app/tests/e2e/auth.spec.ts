import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should login with valid credentials', async ({ page }) => {
    // Fill login form
    await page.fill('input[name="username"]', 'dev')
    await page.fill('input[name="password"]', 'dev')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Should show dashboard content
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill login form with wrong credentials
    await page.fill('input[name="username"]', 'wronguser')
    await page.fill('input[name="password"]', 'wrongpass')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message')).toContainText('Invalid credentials')
    
    // Should stay on login page
    await expect(page).toHaveURL('/login')
  })

  test('should require both username and password', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('input[name="username"]')).toHaveAttribute('required')
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required')
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[name="username"]', 'dev')
    await page.fill('input[name="password"]', 'dev')
    await page.click('button[type="submit"]')
    
    // Should be on dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Click logout
    await page.click('button[data-testid="logout"]')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })
}) 