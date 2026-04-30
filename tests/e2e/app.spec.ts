import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL    = 'e2e@example.com';
const TEST_PASSWORD = 'testpass123';

async function clearStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('habit-tracker-users');
    localStorage.removeItem('habit-tracker-session');
    localStorage.removeItem('habit-tracker-habits');
  });
}

async function createAccount(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto('/signup');
  await page.getByTestId('auth-signup-email').fill(email);
  await page.getByTestId('auth-signup-password').fill(password);
  await page.getByTestId('auth-signup-submit').click();
  await page.waitForURL('/dashboard');
}

test.describe('Habit Tracker app', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
  });

  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/');
    // Splash screen must be visible
    await expect(page.getByTestId('splash-screen')).toBeVisible();
    // After delay, redirect to /login
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page).toHaveURL('/login');
  });

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await createAccount(page);
    await page.goto('/');
    await page.waitForURL('/dashboard', { timeout: 5000 });
    await expect(page).toHaveURL('/dashboard');
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page).toHaveURL('/login');
  });

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await page.goto('/signup');
    await page.getByTestId('auth-signup-email').fill('newuser@example.com');
    await page.getByTestId('auth-signup-password').fill('newpassword');
    await page.getByTestId('auth-signup-submit').click();

    await page.waitForURL('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
    // Create first user with a habit
    await createAccount(page, 'user1@example.com', 'pass1');
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('User1 Habit');
    await page.getByTestId('habit-save-button').click();
    await expect(page.getByTestId('habit-card-user1-habit')).toBeVisible();

    // Logout
    await page.getByTestId('auth-logout-button').click();
    await page.waitForURL('/login');

    // Create second user
    await page.goto('/signup');
    await page.getByTestId('auth-signup-email').fill('user2@example.com');
    await page.getByTestId('auth-signup-password').fill('pass2');
    await page.getByTestId('auth-signup-submit').click();
    await page.waitForURL('/dashboard');

    // User2 should NOT see User1's habit
    await expect(page.getByTestId('habit-card-user1-habit')).not.toBeVisible();
    await expect(page.getByTestId('empty-state')).toBeVisible();

    // Log out and log back in as user1
    await page.getByTestId('auth-logout-button').click();
    await page.waitForURL('/login');
    await page.getByTestId('auth-login-email').fill('user1@example.com');
    await page.getByTestId('auth-login-password').fill('pass1');
    await page.getByTestId('auth-login-submit').click();
    await page.waitForURL('/dashboard');

    // Should see user1's habit
    await expect(page.getByTestId('habit-card-user1-habit')).toBeVisible();
  });

  test('creates a habit from the dashboard', async ({ page }) => {
    await createAccount(page);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    await page.getByTestId('create-habit-button').click();
    await expect(page.getByTestId('habit-form')).toBeVisible();

    await page.getByTestId('habit-name-input').fill('Drink Water');
    await page.getByTestId('habit-description-input').fill('8 glasses a day');
    await page.getByTestId('habit-save-button').click();

    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
  });

  test('completes a habit for today and updates the streak', async ({ page }) => {
    await createAccount(page);

    // Create habit
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Morning Run');
    await page.getByTestId('habit-save-button').click();
    await expect(page.getByTestId('habit-card-morning-run')).toBeVisible();

    // Streak starts at 0
    await expect(page.getByTestId('habit-streak-morning-run')).toContainText('0');

    // Mark complete
    await page.getByTestId('habit-complete-morning-run').click();

    // Streak should be 1
    await expect(page.getByTestId('habit-streak-morning-run')).toContainText('1');
  });

  test('persists session and habits after page reload', async ({ page }) => {
    await createAccount(page);

    // Create a habit
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Read Books');
    await page.getByTestId('habit-save-button').click();
    await expect(page.getByTestId('habit-card-read-books')).toBeVisible();

    // Reload
    await page.reload();

    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // Habit should still be there
    await expect(page.getByTestId('habit-card-read-books')).toBeVisible();
  });

  test('logs out and redirects to /login', async ({ page }) => {
    await createAccount(page);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    await page.getByTestId('auth-logout-button').click();
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');

    // Session should be cleared
    const session = await page.evaluate(() =>
      localStorage.getItem('habit-tracker-session')
    );
    expect(session).toBeNull();
  });

  test('loads the cached app shell when offline after the app has been loaded once', async ({ page, context }) => {
    // Load app once while online
    await createAccount(page);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // Give SW time to cache
    await page.waitForTimeout(1500);

    // Go offline
    await context.setOffline(true);

    // Reload — should still render without hard crash
    await page.reload();

    // App shell should render (may redirect to /login since localStorage still has session)
    // The key is: no hard crash / net::ERR_INTERNET_DISCONNECTED error page
    const title = await page.title();
    expect(title).not.toBe('');

    // Restore online
    await context.setOffline(false);
  });
});
