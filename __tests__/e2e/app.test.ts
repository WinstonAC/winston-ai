import { test, expect } from '@playwright/test';

// Helper function to set auth state
async function authenticateUser(page) {
  // Set up auth state before navigation
  await page.addInitScript(() => {
    window.localStorage.setItem('supabase.auth.token', JSON.stringify({
      currentSession: {
        access_token: 'test-token',
        refresh_token: 'test-refresh-token',
        expires_at: Date.now() + 3600 * 1000,
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          role: 'authenticated'
        }
      }
    }));
  });
}

test.describe('App', () => {
  test('redirects to sign in when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/auth/signin');
  });

  test('successful sign in flow', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Fill in email
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('text=Continue with Email');
    
    // Wait for magic link sent message
    await expect(page.getByText(/sent a magic link/)).toBeVisible();
  });

  test('displays campaign metrics and analytics', async ({ page }) => {
    await authenticateUser(page);
    await page.goto('/campaigns');
    
    // Check for campaign metrics
    await expect(page.getByText('Total Campaigns')).toBeVisible();
    await expect(page.getByText('Active Campaigns')).toBeVisible();
    await expect(page.getByText('Total Leads')).toBeVisible();
    
    // Check for analytics chart
    await expect(page.locator('[data-testid="line-chart"]')).toBeVisible();
  });

  test('can create new campaign', async ({ page }) => {
    await authenticateUser(page);
    await page.goto('/campaigns');
    
    // Click create campaign button
    await page.getByRole('button', { name: /Create Campaign/i }).click();
    await expect(page).toHaveURL('/campaigns/new');
    
    // Fill in campaign details
    await page.getByLabel('Campaign Name').fill('Test Campaign');
    await page.getByLabel('Description').fill('Test campaign description');
    
    // Navigate through steps
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();
    
    // Submit form
    await page.getByRole('button', { name: /Create Campaign/i }).click();
    
    // Should redirect to campaigns list
    await expect(page).toHaveURL('/campaigns');
    
    // New campaign should be visible
    await expect(page.getByText('Test Campaign')).toBeVisible();
  });

  test('can view campaign details', async ({ page }) => {
    await authenticateUser(page);
    await page.goto('/campaigns');
    
    // Click view details on first campaign
    await page.getByRole('button', { name: /View Details/i }).first().click();
    
    // Should show campaign details
    await expect(page.getByText('Campaign Details')).toBeVisible();
  });
}); 