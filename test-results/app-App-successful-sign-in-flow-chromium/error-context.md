# Test info

- Name: App >> successful sign in flow
- Location: /Users/billycampbell/Library/Mobile Documents/com~apple~CloudDocs/Projects/winston-ai/__tests__/e2e/app.test.ts:28:7

# Error details

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')
    - waiting for" http://localhost:3000/auth/signin" navigation to finish...
    - navigated to "http://localhost:3000/auth/signin"

    at /Users/billycampbell/Library/Mobile Documents/com~apple~CloudDocs/Projects/winston-ai/__tests__/e2e/app.test.ts:32:16
```

# Page snapshot

```yaml
- alert
- dialog "Server Error":
  - navigation:
    - button "previous" [disabled]:
      - img "previous"
    - button "next" [disabled]:
      - img "next"
    - text: 1 of 1 unhandled error
  - heading "Server Error" [level=1]
  - paragraph: "ReferenceError: window is not defined"
  - text: This error happened while generating the page. Any console logs will be displayed in the terminal window.
  - heading "Source" [level=2]
  - link "pages/auth/signin.tsx (31:27) @ window":
    - text: pages/auth/signin.tsx (31:27) @ window
    - img
  - text: "29 | appearance={{ theme: ThemeSupa }} 30 | providers={['google']} > 31 | redirectTo={`${window.location.origin}/dashboard`} | ^ 32 | /> 33 | </div> 34 | </div>"
  - button "Show collapsed frames"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // Helper function to set auth state
   4 | async function authenticateUser(page) {
   5 |   // Set up auth state before navigation
   6 |   await page.addInitScript(() => {
   7 |     window.localStorage.setItem('supabase.auth.token', JSON.stringify({
   8 |       currentSession: {
   9 |         access_token: 'test-token',
  10 |         refresh_token: 'test-refresh-token',
  11 |         expires_at: Date.now() + 3600 * 1000,
  12 |         user: {
  13 |           id: 'test-user-id',
  14 |           email: 'test@example.com',
  15 |           role: 'authenticated'
  16 |         }
  17 |       }
  18 |     }));
  19 |   });
  20 | }
  21 |
  22 | test.describe('App', () => {
  23 |   test('redirects to sign in when not authenticated', async ({ page }) => {
  24 |     await page.goto('/');
  25 |     await expect(page).toHaveURL('/auth/signin');
  26 |   });
  27 |
  28 |   test('successful sign in flow', async ({ page }) => {
  29 |     await page.goto('/auth/signin');
  30 |     
  31 |     // Fill in email
> 32 |     await page.fill('input[type="email"]', 'test@example.com');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  33 |     await page.click('text=Continue with Email');
  34 |     
  35 |     // Wait for magic link sent message
  36 |     await expect(page.getByText(/sent a magic link/)).toBeVisible();
  37 |   });
  38 |
  39 |   test('displays campaign metrics and analytics', async ({ page }) => {
  40 |     await authenticateUser(page);
  41 |     await page.goto('/campaigns');
  42 |     
  43 |     // Check for campaign metrics
  44 |     await expect(page.getByText('Total Campaigns')).toBeVisible();
  45 |     await expect(page.getByText('Active Campaigns')).toBeVisible();
  46 |     await expect(page.getByText('Total Leads')).toBeVisible();
  47 |     
  48 |     // Check for analytics chart
  49 |     await expect(page.locator('[data-testid="line-chart"]')).toBeVisible();
  50 |   });
  51 |
  52 |   test('can create new campaign', async ({ page }) => {
  53 |     await authenticateUser(page);
  54 |     await page.goto('/campaigns');
  55 |     
  56 |     // Click create campaign button
  57 |     await page.getByRole('button', { name: /Create Campaign/i }).click();
  58 |     await expect(page).toHaveURL('/campaigns/new');
  59 |     
  60 |     // Fill in campaign details
  61 |     await page.getByLabel('Campaign Name').fill('Test Campaign');
  62 |     await page.getByLabel('Description').fill('Test campaign description');
  63 |     
  64 |     // Navigate through steps
  65 |     await page.getByRole('button', { name: /Next/i }).click();
  66 |     await page.getByRole('button', { name: /Next/i }).click();
  67 |     await page.getByRole('button', { name: /Next/i }).click();
  68 |     await page.getByRole('button', { name: /Next/i }).click();
  69 |     
  70 |     // Submit form
  71 |     await page.getByRole('button', { name: /Create Campaign/i }).click();
  72 |     
  73 |     // Should redirect to campaigns list
  74 |     await expect(page).toHaveURL('/campaigns');
  75 |     
  76 |     // New campaign should be visible
  77 |     await expect(page.getByText('Test Campaign')).toBeVisible();
  78 |   });
  79 |
  80 |   test('can view campaign details', async ({ page }) => {
  81 |     await authenticateUser(page);
  82 |     await page.goto('/campaigns');
  83 |     
  84 |     // Click view details on first campaign
  85 |     await page.getByRole('button', { name: /View Details/i }).first().click();
  86 |     
  87 |     // Should show campaign details
  88 |     await expect(page.getByText('Campaign Details')).toBeVisible();
  89 |   });
  90 | }); 
```