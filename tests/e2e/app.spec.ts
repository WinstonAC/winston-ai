import { test, expect } from '@playwright/test';

test.describe('Winston AI Application Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Authentication Flow', async ({ page }) => {
    // Test Sign Up
    await page.click('text=Sign Up');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.fill('input[name="name"]', 'Test User');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Test Logout
    await page.click('text=Logout');
    await expect(page).toHaveURL('/');

    // Test Login
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Campaign Management', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');

    // Create Campaign
    await page.goto('/campaigns');
    await page.click('text=Create Campaign');
    await page.fill('input[name="name"]', 'Test Campaign');
    await page.fill('textarea[name="description"]', 'Test Description');
    await page.click('button[type="submit"]');
    await expect(page).toHaveText('Campaign created successfully');

    // Edit Campaign
    await page.click('text=Edit');
    await page.fill('input[name="name"]', 'Updated Campaign');
    await page.click('button[type="submit"]');
    await expect(page).toHaveText('Campaign updated successfully');

    // Delete Campaign
    await page.click('text=Delete');
    await page.click('button:has-text("Confirm")');
    await expect(page).toHaveText('Campaign deleted successfully');
  });

  test('Lead Management', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');

    // Import Leads
    await page.goto('/leads');
    await page.setInputFiles('input[type="file"]', 'test-data/leads.csv');
    await page.click('button:has-text("Import")');
    await expect(page).toHaveText('Leads imported successfully');

    // View Leads
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tr')).toHaveCount(2); // Header + at least one lead

    // Update Lead Status
    await page.click('button:has-text("Update Status")');
    await page.selectOption('select[name="status"]', 'qualified');
    await page.click('button:has-text("Save")');
    await expect(page).toHaveText('Status updated successfully');
  });

  test('Team Management', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');

    // Create Team
    await page.goto('/team');
    await page.click('text=Create Team');
    await page.fill('input[name="name"]', 'Test Team');
    await page.click('button[type="submit"]');
    await expect(page).toHaveText('Team created successfully');

    // Invite Member
    await page.click('text=Invite Member');
    await page.fill('input[name="email"]', 'member@example.com');
    await page.selectOption('select[name="role"]', 'member');
    await page.click('button[type="submit"]');
    await expect(page).toHaveText('Invitation sent successfully');
  });

  test('Analytics', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');

    // Check Dashboard
    await page.goto('/dashboard');
    await expect(page.locator('.stat-card')).toHaveCount(4);
    await expect(page.locator('.chart')).toBeVisible();

    // Check Campaign Analytics
    await page.goto('/analytics');
    await expect(page.locator('.campaign-stats')).toBeVisible();
    await expect(page.locator('.lead-stats')).toBeVisible();
  });

  test('Settings', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');

    // Update Profile
    await page.goto('/settings');
    await page.fill('input[name="name"]', 'Updated Name');
    await page.click('button:has-text("Save Profile")');
    await expect(page).toHaveText('Profile updated successfully');

    // Update Notification Settings
    await page.click('text=Notifications');
    await page.check('input[name="emailNotifications"]');
    await page.click('button:has-text("Save Settings")');
    await expect(page).toHaveText('Settings updated successfully');
  });
}); 