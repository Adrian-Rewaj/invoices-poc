import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="username"]', 'dev')
    await page.fill('input[name="password"]', 'dev')
    await page.click('button[type="submit"]')
    
    // Should be on dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('should display dashboard with clients and invoices', async ({ page }) => {
    // Should show dashboard title
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // Should show clients section
    await expect(page.locator('h2')).toContainText('Klienci')
    
    // Should show invoices section
    await expect(page.locator('h2')).toContainText('Faktury')
  })

  test('should add new client', async ({ page }) => {
    // Click add client button
    await page.click('button[data-testid="add-client"]')
    
    // Fill client form
    await page.fill('input[name="name"]', 'Test Client')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="nip"]', '1234567890')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.locator('.success-message')).toBeVisible()
    
    // Should show new client in list
    await expect(page.locator('text=Test Client')).toBeVisible()
  })

  test('should create new invoice', async ({ page }) => {
    // Click add invoice button
    await page.click('button[data-testid="add-invoice"]')
    
    // Select client
    await page.selectOption('select[name="clientId"]', '1')
    
    // Fill invoice details
    await page.fill('input[name="invoiceNumber"]', 'INV-2024-001')
    await page.fill('input[name="issueDate"]', '2024-01-15')
    await page.fill('input[name="dueDate"]', '2024-02-15')
    
    // Add invoice item
    await page.click('button[data-testid="add-item"]')
    await page.fill('input[name="itemName"]', 'Test Service')
    await page.fill('input[name="itemQuantity"]', '1')
    await page.fill('input[name="itemPrice"]', '100')
    await page.fill('input[name="itemVat"]', '23')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.locator('.success-message')).toBeVisible()
    
    // Should show new invoice in list
    await expect(page.locator('text=INV-2024-001')).toBeVisible()
  })

  test('should download invoice PDF', async ({ page }) => {
    // Find an invoice with PDF
    const invoiceRow = page.locator('tr').filter({ hasText: 'INV-2024-001' })
    
    // Click download button
    await invoiceRow.locator('button[data-testid="download-pdf"]').click()
    
    // Should trigger download
    const downloadPromise = page.waitForEvent('download')
    await downloadPromise
    
    // Verify download started
    expect(downloadPromise).toBeDefined()
  })

  test('should filter invoices by status', async ({ page }) => {
    // Click on status filter
    await page.click('button[data-testid="filter-draft"]')
    
    // Should show only draft invoices
    await expect(page.locator('tr')).toContainText('draft')
    
    // Click on paid filter
    await page.click('button[data-testid="filter-paid"]')
    
    // Should show only paid invoices
    await expect(page.locator('tr')).toContainText('paid')
  })

  test('should search clients', async ({ page }) => {
    // Type in search box
    await page.fill('input[data-testid="client-search"]', 'Test')
    
    // Should filter clients
    await expect(page.locator('tr')).toContainText('Test')
  })
}) 