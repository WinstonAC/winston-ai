import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test.beforeEach(async ({ context }) => {
    // Clear cookies and storage for a fresh session
    await context.clearCookies();
    await context.clearPermissions();
  });

  test('should redirect to signin page when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.url()).toContain('/auth/signin');
  });

  test('should successfully register a new user', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Wait for the page to be ready
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Switch to registration mode
    await page.click('text=Need an account? Register');
    
    // Fill registration form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    // Submit registration
    await page.click('button:has-text("Register")');
    
    // Wait for success message
    await expect(page.locator('text=Registration successful! You can now sign in.')).toBeVisible({ timeout: 15000 });
  });

  test('should handle sign in with invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Wait for the page to be ready
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Fill signin form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit signin
    await page.click('button:has-text("Sign in")');
    
    // Wait for error message
    await expect(page.locator('text=Authentication failed. Please try again.')).toBeVisible({ timeout: 15000 });
  });

  test('should successfully sign in with valid credentials', async ({ page }) => {
    // First register the user
    await page.goto('/auth/signin');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    await page.click('text=Need an account? Register');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Register")');
    await expect(page.locator('text=Registration successful! You can now sign in.')).toBeVisible({ timeout: 15000 });

    // Now try to sign in
    await page.goto('/auth/signin');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Sign in")');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('should maintain session after page refresh', async ({ page }) => {
    // First register and sign in
    await page.goto('/auth/signin');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    await page.click('text=Need an account? Register');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Register")');
    await expect(page.locator('text=Registration successful! You can now sign in.')).toBeVisible({ timeout: 15000 });

    await page.goto('/auth/signin');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Sign in")');
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    
    // Refresh page
    await page.reload();
    
    // Should stay on dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('should sign out successfully', async ({ page }) => {
    // First register and sign in
    await page.goto('/auth/signin');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    await page.click('text=Need an account? Register');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Register")');
    await expect(page.locator('text=Registration successful! You can now sign in.')).toBeVisible({ timeout: 15000 });

    await page.goto('/auth/signin');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Sign in")');
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    
    // Click sign out button
    await page.click('button:has-text("Sign out")');
    
    // Should be redirected to signin page
    await expect(page.url()).toContain('/auth/signin');
  });
}); 