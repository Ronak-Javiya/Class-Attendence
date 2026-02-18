import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard and Features', () => {
  // Helper function to login as admin
  async function loginAsAdmin(page) {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill('admin@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/admin');
  }

  test.describe('Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('should display admin dashboard', async ({ page }) => {
      await expect(page.getByText('Admin Control Center')).toBeVisible();
      await expect(page.getByText('System overview and administrative controls')).toBeVisible();
    });

    test('should display statistics cards', async ({ page }) => {
      await expect(page.getByText('Pending Enrollments')).toBeVisible();
      await expect(page.getByText('Total Users')).toBeVisible();
      await expect(page.getByText('Active Classes')).toBeVisible();
      await expect(page.getByText("Today's Attendance")).toBeVisible();
    });

    test('should have quick actions', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'System Status: Operational' })).toBeVisible();
    });

    test('should show pending enrollments section', async ({ page }) => {
      await expect(page.getByText('Pending Enrollments')).toBeVisible();
    });
  });

  test.describe('Admin Enrollments', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/enrollments');
    });

    test('should display enrollments page', async ({ page }) => {
      await expect(page.getByText('Enrollment Management')).toBeVisible();
      await expect(page.getByText('Review and manage student enrollment requests')).toBeVisible();
    });

    test('should display statistics', async ({ page }) => {
      await expect(page.getByText('Pending')).toBeVisible();
      await expect(page.getByText('Approved')).toBeVisible();
      await expect(page.getByText('Rejected')).toBeVisible();
      await expect(page.getByText('Total')).toBeVisible();
    });

    test('should have search and filter', async ({ page }) => {
      await expect(page.getByPlaceholder('Search by student name, email, or class...')).toBeVisible();
      await expect(page.getByRole('combobox').first()).toBeVisible();
    });

    test('should have bulk actions', async ({ page }) => {
      // Check for select all checkbox
      const checkboxes = page.locator('input[type="checkbox"]');
      if (await checkboxes.first().isVisible().catch(() => false)) {
        await checkboxes.first().click();
        await expect(page.getByText(/item|items selected/)).toBeVisible();
      }
    });

    test('should show enrollment list', async ({ page }) => {
      await expect(page.getByText(/enrollments found/i)).toBeVisible();
    });
  });

  test.describe('Admin Overrides', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/overrides');
    });

    test('should display overrides page', async ({ page }) => {
      await expect(page.getByText('Attendance Overrides')).toBeVisible();
      await expect(page.getByText('Override attendance records with proper authorization')).toBeVisible();
    });

    test('should display statistics', async ({ page }) => {
      await expect(page.getByText('Total Overrides')).toBeVisible();
      await expect(page.getByText('Changed to Present')).toBeVisible();
      await expect(page.getByText('Changed to Absent')).toBeVisible();
    });

    test('should have search functionality', async ({ page }) => {
      await expect(page.getByPlaceholder('Search attendance records...')).toBeVisible();
    });

    test('should show override history', async ({ page }) => {
      await expect(page.getByText('Recent Overrides')).toBeVisible();
      await expect(page.getByText('History of attendance record modifications')).toBeVisible();
    });
  });

  test.describe('Admin Reports', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/reports');
    });

    test('should display reports page', async ({ page }) => {
      await expect(page.getByText('Reports')).toBeVisible();
      await expect(page.getByText('Generate and download attendance reports')).toBeVisible();
    });

    test('should have report type selection', async ({ page }) => {
      await expect(page.getByText('Attendance Summary')).toBeVisible();
      await expect(page.getByText('Student Attendance Detail')).toBeVisible();
      await expect(page.getByText('Class Attendance Report')).toBeVisible();
      await expect(page.getByText('Dispute Summary')).toBeVisible();
    });

    test('should have date range selection', async ({ page }) => {
      await expect(page.getByText('Start Date')).toBeVisible();
      await expect(page.getByText('End Date')).toBeVisible();
    });

    test('should have format selection', async ({ page }) => {
      await expect(page.getByText('Excel (.xlsx)')).toBeVisible();
      await expect(page.getByText('PDF Document')).toBeVisible();
      await expect(page.getByText('CSV File')).toBeVisible();
    });

    test('should have generate report button', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Generate Report' })).toBeVisible();
    });
  });

  test.describe('Navigation and Layout', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page);
    });

    test('should have working sidebar navigation', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Enrollments' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Overrides' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Reports' })).toBeVisible();
    });

    test('should navigate to all admin pages', async ({ page }) => {
      const pages = [
        { link: 'Dashboard', url: '/admin', text: 'Admin Control Center' },
        { link: 'Enrollments', url: '/admin/enrollments', text: 'Enrollment Management' },
        { link: 'Overrides', url: '/admin/overrides', text: 'Attendance Overrides' },
        { link: 'Reports', url: '/admin/reports', text: 'Reports' },
      ];

      for (const navPage of pages) {
        await page.getByRole('link', { name: navPage.link }).click();
        await expect(page).toHaveURL(navPage.url);
        await expect(page.getByText(navPage.text).first()).toBeVisible();
      }
    });
  });
});
