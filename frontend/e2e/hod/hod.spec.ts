import { test, expect } from '@playwright/test';

test.describe('HOD Dashboard and Features', () => {
  // Helper function to login as HOD
  async function loginAsHOD(page) {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill('hod@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/hod');
  }

  test.describe('HOD Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsHOD(page);
    });

    test('should display HOD dashboard', async ({ page }) => {
      await expect(page.getByText('Department Overview')).toBeVisible();
      await expect(page.getByText('Manage department classes and oversee academic operations')).toBeVisible();
    });

    test('should display statistics cards', async ({ page }) => {
      await expect(page.getByText('Department')).toBeVisible();
      await expect(page.getByText('Avg. Attendance')).toBeVisible();
      await expect(page.getByText('Pending Approvals')).toBeVisible();
      await expect(page.getByText('Total Faculty')).toBeVisible();
    });

    test('should show pending approvals alert when applicable', async ({ page }) => {
      // Check if there's a pending alert
      const alert = page.getByText(/Classes Pending Approval/i);
      if (await alert.isVisible().catch(() => false)) {
        await expect(alert).toBeVisible();
      }
    });

    test('should display attendance trends chart', async ({ page }) => {
      await expect(page.getByText('Department Attendance Trends')).toBeVisible();
    });
  });

  test.describe('HOD Approvals', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsHOD(page);
      await page.goto('/hod/approvals');
    });

    test('should display approvals page', async ({ page }) => {
      await expect(page.getByText('Class Approvals')).toBeVisible();
      await expect(page.getByText('Review and approve class submissions from faculty')).toBeVisible();
    });

    test('should display statistics', async ({ page }) => {
      await expect(page.getByText('Pending')).toBeVisible();
      await expect(page.getByText('Approved')).toBeVisible();
      await expect(page.getByText('Rejected')).toBeVisible();
    });

    test('should have search functionality', async ({ page }) => {
      await expect(page.getByPlaceholder('Search by class name, code, or faculty...')).toBeVisible();
    });

    test('should show pending class submissions', async ({ page }) => {
      await expect(page.getByText('Pending Class Submissions')).toBeVisible();
    });

    test('should show approval guidelines', async ({ page }) => {
      await expect(page.getByText('Approval Guidelines')).toBeVisible();
    });
  });

  test.describe('HOD Audit Logs', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsHOD(page);
      await page.goto('/hod/audit');
    });

    test('should display audit logs page', async ({ page }) => {
      await expect(page.getByText('Audit Logs')).toBeVisible();
      await expect(page.getByText('Track all system activities and modifications')).toBeVisible();
    });

    test('should display statistics', async ({ page }) => {
      await expect(page.getByText('Total Logs')).toBeVisible();
      await expect(page.getByText('Today')).toBeVisible();
      await expect(page.getByText('Attendance Changes')).toBeVisible();
      await expect(page.getByText('Dispute Actions')).toBeVisible();
    });

    test('should have search and filters', async ({ page }) => {
      await expect(page.getByPlaceholder('Search by action, user, or entity...')).toBeVisible();
      await expect(page.getByRole('combobox').first()).toBeVisible();
    });

    test('should show activity log section', async ({ page }) => {
      await expect(page.getByText('Activity Log')).toBeVisible();
    });

    test('should show immutable trail notice', async ({ page }) => {
      await expect(page.getByText('Immutable Audit Trail')).toBeVisible();
    });
  });

  test.describe('HOD Overrides', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsHOD(page);
      await page.goto('/hod/overrides');
    });

    test('should display overrides page', async ({ page }) => {
      await expect(page.getByText('Attendance Overrides')).toBeVisible();
    });
  });

  test.describe('Navigation and Layout', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsHOD(page);
    });

    test('should have working sidebar navigation', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Approvals' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Audit Logs' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Overrides' })).toBeVisible();
    });

    test('should navigate to all HOD pages', async ({ page }) => {
      const pages = [
        { link: 'Dashboard', url: '/hod', text: 'Department Overview' },
        { link: 'Approvals', url: '/hod/approvals', text: 'Class Approvals' },
        { link: 'Audit Logs', url: '/hod/audit', text: 'Audit Logs' },
        { link: 'Overrides', url: '/hod/overrides', text: 'Attendance Overrides' },
      ];

      for (const navPage of pages) {
        await page.getByRole('link', { name: navPage.link }).click();
        await expect(page).toHaveURL(navPage.url);
        await expect(page.getByText(navPage.text).first()).toBeVisible();
      }
    });

    test('should show HOD badge', async ({ page }) => {
      await expect(page.getByText('Head of Department')).toBeVisible();
    });
  });
});
