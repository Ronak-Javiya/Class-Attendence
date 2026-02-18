import { test, expect } from '@playwright/test';

test.describe('Faculty Dashboard and Features', () => {
  // Helper function to login as faculty
  async function loginAsFaculty(page) {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill('faculty@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/faculty');
  }

  test.describe('Faculty Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsFaculty(page);
    });

    test('should display faculty dashboard', async ({ page }) => {
      await expect(page.getByText(/Welcome, Professor/)).toBeVisible();
      await expect(page.getByText('Manage your classes and track student attendance')).toBeVisible();
    });

    test('should display statistics cards', async ({ page }) => {
      await expect(page.getByText('Total Classes')).toBeVisible();
      await expect(page.getByText('Active Classes')).toBeVisible();
      await expect(page.getByText("Today's Lectures")).toBeVisible();
      await expect(page.getByText('Pending Disputes')).toBeVisible();
    });

    test('should show todays schedule', async ({ page }) => {
      await expect(page.getByText("Today's Schedule")).toBeVisible();
      await expect(page.getByRole('button', { name: /View All Classes/i })).toBeVisible();
    });

    test('should have take attendance button', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Take Attendance' })).toBeVisible();
    });
  });

  test.describe('Faculty Classes', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsFaculty(page);
      await page.goto('/faculty/classes');
    });

    test('should display classes management page', async ({ page }) => {
      await expect(page.getByText('My Classes')).toBeVisible();
      await expect(page.getByText('Manage your classes and view enrolled students')).toBeVisible();
    });

    test('should have search and filter', async ({ page }) => {
      await expect(page.getByPlaceholder('Search classes...')).toBeVisible();
      await expect(page.getByRole('combobox').first()).toBeVisible();
    });

    test('should display class list', async ({ page }) => {
      await expect(page.getByText('Classes')).toBeVisible();
    });

    test('should show student list when class is selected', async ({ page }) => {
      // Click on first class if available
      const firstClass = page.locator('button').filter({ hasText: /Semester/ }).first();
      if (await firstClass.isVisible().catch(() => false)) {
        await firstClass.click();
        await expect(page.getByText('Enrolled Students')).toBeVisible();
      }
    });
  });

  test.describe('Faculty Attendance', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsFaculty(page);
      await page.goto('/faculty/attendance');
    });

    test('should display attendance wizard', async ({ page }) => {
      await expect(page.getByText('Take Attendance')).toBeVisible();
      await expect(page.getByText('Use AI-powered face recognition to automatically mark attendance')).toBeVisible();
    });

    test('should show step progress', async ({ page }) => {
      await expect(page.getByText('Select Class')).toBeVisible();
      await expect(page.getByText('Upload Photos')).toBeVisible();
      await expect(page.getByText('Processing')).toBeVisible();
      await expect(page.getByText('Complete')).toBeVisible();
    });

    test('should have class selection step', async ({ page }) => {
      await expect(page.getByText('Select Class & Time Slot')).toBeVisible();
      await expect(page.getByText('Choose the class and schedule slot for this lecture')).toBeVisible();
    });

    test('should show class dropdown', async ({ page }) => {
      await expect(page.getByRole('combobox').first()).toBeVisible();
    });
  });

  test.describe('Faculty Disputes', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsFaculty(page);
      await page.goto('/faculty/disputes');
    });

    test('should display disputes page', async ({ page }) => {
      await expect(page.getByText('Dispute Review')).toBeVisible();
      await expect(page.getByText('Review and resolve student attendance disputes')).toBeVisible();
    });

    test('should display statistics', async ({ page }) => {
      await expect(page.getByText('Total Disputes')).toBeVisible();
      await expect(page.getByText('Pending Review')).toBeVisible();
      await expect(page.getByText('Approved')).toBeVisible();
      await expect(page.getByText('Rejected')).toBeVisible();
    });

    test('should have filters', async ({ page }) => {
      await expect(page.getByPlaceholder('Search by student name or reason...')).toBeVisible();
      await expect(page.getByRole('combobox').first()).toBeVisible();
    });

    test('should show resolution guidelines', async ({ page }) => {
      await expect(page.getByText('Dispute Resolution Guidelines')).toBeVisible();
    });
  });

  test.describe('Navigation and Layout', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsFaculty(page);
    });

    test('should have working sidebar navigation', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'My Classes' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Attendance' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Disputes' })).toBeVisible();
    });

    test('should navigate to all faculty pages', async ({ page }) => {
      const pages = [
        { link: 'Dashboard', url: '/faculty', text: 'Welcome' },
        { link: 'My Classes', url: '/faculty/classes', text: 'My Classes' },
        { link: 'Attendance', url: '/faculty/attendance', text: 'Take Attendance' },
        { link: 'Disputes', url: '/faculty/disputes', text: 'Dispute Review' },
      ];

      for (const navPage of pages) {
        await page.getByRole('link', { name: navPage.link }).click();
        await expect(page).toHaveURL(navPage.url);
        await expect(page.getByText(navPage.text).first()).toBeVisible();
      }
    });
  });
});
